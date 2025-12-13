// server/routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import Joi from 'joi'; // New: Import Joi for validation

const router = express.Router();

// ユーザー登録
// Joi schema for register validation (simplified for 'users' table fields)
const registerSchema = Joi.object({
  email: Joi.string().email().min(5).required().messages({
    'string.email': '有効なメールアドレスを入力してください。',
    'string.min': 'メールアドレスは5文字以上で入力してください。',
    'any.required': 'メールアドレスは必須です。',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'パスワードは6文字以上で入力してください。',
    'any.required': 'パスワードは必須です。',
  }),
  name: Joi.string().min(2).required().messages({ // Assuming name is required
    'string.min': '名前は2文字以上で入力してください。',
    'any.required': '名前は必須です。',
  }),
  role: Joi.string().valid('facility', 'user', 'planner', 'care_manager').required().messages({ // Validate role
    'any.only': '無効なユーザー種別です。',
    'any.required': 'ユーザー種別は必須です。',
  }),
  // User-specific fields that go into 'users' table
  phone_number: Joi.string()
  .pattern(/^\d{10,11}$/)
  .required()
  .messages({
    'string.pattern.base': '電話番号は数字のみで10〜11桁入力してください。',
    'any.required': '電話番号は必須です。',
  }),
  user_type: Joi.string().valid('本人', '家族・支援者').when('role', {
    is: 'user',
    then: Joi.string().required().messages({ 'any.required': '利用対象は必須です。' }),
    otherwise: Joi.optional()
  }),
  desired_services: Joi.array().items(Joi.string()).when('role', {
    is: 'user',
    then: Joi.array().min(1).required().messages({
      'array.min': '希望サービス種別を最低1つ選択してください。',
      'any.required': '希望サービス種別は必須です。',
    }),
    otherwise: Joi.optional()
  }),
  // For 'facility' role, facility_name is part of the 'users' table
  facility_name: Joi.string().when('role', {
    is: 'facility',
    then: Joi.string().min(2).required().messages({
      'string.min': '事業所名は2文字以上で入力してください。',
      'any.required': '事業所名は必須です。',
    }),
    otherwise: Joi.optional()
  }),
  // All other facility-specific fields are handled by /facilities endpoint on frontend,
  // so they are not directly validated or inserted here. These are optional in the schema here.
  facility_prefecture: Joi.optional(),
  facility_city: Joi.optional(),
  facility_description: Joi.string().optional(),
  facility_service_types: Joi.optional(),
  capacity: Joi.optional(),
  operating_days: Joi.optional(),
  shuttle_service: Joi.boolean().optional(),
  lunch_provided: Joi.boolean().optional(),
  trial_booking_available: Joi.boolean().optional(),
  pc_work_available: Joi.boolean().optional(),
});

// User registration
router.post('/register', async (req, res) => {
  try {
    // Validate request body using Joi
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      // Extract specific validation messages
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    const { email, password, name, role, phone_number, user_type, desired_services, facility_name } = value;

    // Email duplication check
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'このメールアドレスは既に登録されています。ログインしてください。' });
    }
　　// パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    let insertQuery = '';
    let queryParams: any[] = []; // Explicitly type as any[]

    // NOTE: DB schema migration renamed users.password -> users.password_hash
    if (role === 'user') {
      insertQuery =
        'INSERT INTO users (email, password_hash, name, role, phone_number, user_type, desired_services) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) ' +
        'RETURNING id, email, name, role';
      queryParams = [email, hashedPassword, name, role, phone_number, user_type, JSON.stringify(desired_services)];
    } else if (role === 'facility') {
      insertQuery =
        'INSERT INTO users (email, password_hash, name, role, phone_number) ' +
        'VALUES ($1, $2, $3, $4, $5) ' +
        'RETURNING id, email, name, role';
      queryParams = [email, hashedPassword, name, role, phone_number];
    } else { // For planner/care_manager roles, assuming simple user fields
      insertQuery =
        'INSERT INTO users (email, password_hash, name, role, phone_number) ' +
        'VALUES ($1, $2, $3, $4, $5) ' +
        'RETURNING id, email, name, role';
      queryParams = [email, hashedPassword, name, role, phone_number];
    }

    const result = await query(insertQuery, queryParams);

    const user = result.rows[0];

    // Safer JWT secret handling (avoid fallback 'secret' in production)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    // If Joi error, it would have been caught earlier (status 400).
    // This catch is for unexpected database or server errors.
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // DB schema migration renamed users.password -> users.password_hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
