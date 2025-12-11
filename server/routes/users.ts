import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 繝ｦ繝ｼ繧ｶ繝ｼ繝励Ο繝輔ぅ繝ｼ繝ｫ蜿門ｾ・
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, name, email, role, facility_name, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 繝励Ο繝輔ぅ繝ｼ繝ｫ譖ｴ譁ｰ
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, facility_name } = req.body;
    const result = await query(
      'UPDATE users SET name = $1, facility_name = $2 WHERE id = $3 RETURNING *',
      [name, facility_name, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
