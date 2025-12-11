import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 繝槭ャ繝√Φ繧ｰ謠先｡医ｒ蜿門ｾ・
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT * FROM matching_suggestions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// 繝槭ャ繝√Φ繧ｰ繧剃ｽ懈・
router.post('/', authenticate, async (req, res) => {
  try {
    const { facility_id, user_id } = req.body;
    const result = await query(
      'INSERT INTO matching (facility_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [facility_id, user_id, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create matching' });
  }
});

// 繝槭ャ繝√Φ繧ｰ繧呈価隱・
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE matching SET status = $1 WHERE id = $2 RETURNING *',
      ['accepted', id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept matching' });
  }
});

export default router;
