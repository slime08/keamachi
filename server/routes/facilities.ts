// server/routes/facilities.ts
import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to format facility data
const formatFacility = (facility: any) => {
  if (!facility) return null;

  const availability: any = {};
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  days.forEach(day => {
    // DBの 'mon_availability' なども 'mon' にマッピング
    const dbKey = `${day}_availability`; 
    const dbValue = facility[dbKey];

    // DBの値からフロントエンドの表示に適した値に変換 
    switch (dbValue) {
      case 'open':
      case 'circle':
        availability[day] = 'open';
        break;
      case 'limited':
      case 'triangle':
        availability[day] = 'limited';
        break;
      case 'closed':
      case 'cross':
        availability[day] = 'closed';
        break;
      default:
        // 期待する値は 'open', 'limited', 'closed' のいずれか 
    // 不明な値は 'closed' にフォールバック 
        availability[day] = dbValue && ['open', 'limited', 'closed'].includes(dbValue) ? dbValue : 'closed';
    }
    
    // 不要なフィールドは削除 
    delete facility[dbKey];
  });

      // DBのフィールド名をフロントエンドのキャメルケースに変換   return {
    id: facility.id,
    userId: facility.user_id,
    name: facility.name,
    description: facility.description,
    location: facility.location,
    serviceType: facility.service_type,
    phone: facility.phone,
    website: facility.website,
    rating: facility.rating,
    createdAt: facility.created_at,
    updatedAt: facility.updated_at,
    email: facility.email,
    imageUrl: facility.image_url,
    services: facility.services,
    capacity: facility.capacity,
    staffCount: facility.staff_count,
    operatingHours: facility.operating_hours,
    reviews: facility.reviews,
    availability
  };
};

// 事業所一覧取得
router.get('/', async (req, res) => {
  try {
    // 全てのフィールドを取得
    const result = await query('SELECT * FROM facilities ORDER BY created_at DESC');
    
    const facilities = result.rows.map(formatFacility);

    res.json(facilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// 事業所詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 全てのフィールドを取得
    const result = await query('SELECT * FROM facilities WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = formatFacility(result.rows[0]);

    res.json(facility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// 事業所作成 (このエンドポイントは本来認証が必要だが、とりあえず仮の実装)
router.post('/', authenticate, async (req, res) => {
  try {
    // 実際にはもっと多くのフィールドを受け取るはずだが、今回は最小限の実装
    const { name, description, location, service_type } = req.body;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO facilities (user_id, name, description, location, service_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, description, location, service_type]
    );

    res.status(201).json(formatFacility(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

export default router;
