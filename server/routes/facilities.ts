import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 事業所一覧取得
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM facilities ORDER BY created_at DESC');
    
    // availabilityオブジェクトを整形して追加
    const facilities = result.rows.map(facility => {
      const availability: any = {};
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      
      days.forEach(day => {
        const dbKey = `${day}_availability`;
        const dbValue = facility[dbKey];
        
        // DBの値 (e.g., 'circle', 'triangle', 'cross') をフロントエンドの期待する値に変換
        // ここでは 'circle' -> 'open', 'triangle' -> 'limited', 'cross' -> 'closed' と仮定
        // デフォルトの 'circle' は 'open' とみなす
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
            availability[day] = 'closed'; // 不明な値は 'closed' に
        }
        
        // 元のキーは削除
        delete facility[dbKey];
      });

      return {
        ...facility,
        availability
      };
    });

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
    const result = await query('SELECT * FROM facilities WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = result.rows[0];
    const availability: any = {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    days.forEach(day => {
      const dbKey = `${day}_availability`;
      const dbValue = facility[dbKey];
      
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
          availability[day] = 'closed';
      }
      delete facility[dbKey];
    });

    res.json({
      ...facility,
      availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// 事業所作成
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, location, service_type } = req.body;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO facilities (user_id, name, description, location, service_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, description, location, service_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

export default router;
