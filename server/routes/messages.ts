import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// メッセージ一覧取得
router.get('/conversation/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// メッセージ送信
router.post('/', authenticate, async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const sender_id = req.user.id;

    const result = await query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [conversation_id, sender_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
