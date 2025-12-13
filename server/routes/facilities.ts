// server/routes/facilities.ts
import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * pgエラーをできるだけ詳細にログに残す（constraint特定が最重要）
 */
function logDbError(context: string, error: any, meta?: Record<string, unknown>) {
  const payload = {
    context,
    ...meta,
    message: error?.message,
    code: error?.code,
    detail: error?.detail,
    hint: error?.hint,
    constraint: error?.constraint,
    table: error?.table,
    column: error?.column,
    schema: error?.schema,
    where: error?.where,
    // たまに nested で入ってくるケースもあるので保険
    nested: error?.error
      ? {
          message: error.error?.message,
          code: error.error?.code,
          detail: error.error?.detail,
          constraint: error.error?.constraint,
          table: error.error?.table,
        }
      : undefined,
  };

  console.error('[DB_ERROR]', JSON.stringify(payload, null, 2));
}

/**
 * 文字列化（undefined/nullを空文字へ） ※DBに入れる用
 */
function toText(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

/**
 * 受け取りを統一（snake_case / camelCase の両対応）
 * - フロントが serviceType を送ってもOK
 * - 既存の service_type でもOK
 */
function normalizeFacilityPayload(body: any) {
  const name = body?.name;
  const description = body?.description ?? '';
  const location = body?.location ?? body?.address ?? ''; // ついでに address も許可
  const service_type = body?.service_type ?? body?.serviceType ?? body?.service ?? '';

  return {
    name: toText(name).trim(),
    description: toText(description).trim(),
    location: toText(location).trim(),
    service_type: toText(service_type).trim(),
  };
}

/**
 * Helper to format facility data
 * - 元の row を破壊しない（deleteしない）
 * - availability は mon..sun をまとめて返す
 */
const formatFacility = (row: any) => {
  if (!row) return null;

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  const availability: Record<string, 'open' | 'limited' | 'closed'> = {};

  for (const day of days) {
    const dbKey = `${day}_availability`;
    const dbValue = row[dbKey];

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
        availability[day] =
          dbValue && ['open', 'limited', 'closed'].includes(dbValue) ? dbValue : 'closed';
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    location: row.location,
    serviceType: row.service_type,
    phone: row.phone,
    website: row.website,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    email: row.email,
    imageUrl: row.image_url,
    services: row.services,
    capacity: row.capacity,
    staffCount: row.staff_count,
    operatingHours: row.operating_hours,
    reviews: row.reviews,
    availability,
  };
};

// 事業所一覧取得
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM facilities ORDER BY created_at DESC');
    res.json(result.rows.map(formatFacility));
  } catch (error: any) {
    logDbError('GET /facilities', error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// 事業所詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // idの最低限チェック
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'Invalid facility id' });
    }

    const result = await query('SELECT * FROM facilities WHERE id = $1', [numericId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json(formatFacility(result.rows[0]));
  } catch (error: any) {
    logDbError('GET /facilities/:id', error, { id: req.params.id });
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// 事業所作成/更新（UPSERT）
// - facilities_user_id_unique があるので、user_id で衝突したら UPDATE にする
router.post('/', authenticate, async (req: any, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      // middleware/auth.ts の設定不備を疑う
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, location, service_type } = normalizeFacilityPayload(req.body);

    // 最低限のバリデーション（DBのNOT NULLを踏む前に止める）
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!location) return res.status(400).json({ error: 'location is required' });
    if (!service_type) return res.status(400).json({ error: 'service_type is required' });

    /**
     * ✅ UPSERT:
     * - 初回: INSERT
     * - 同一 user_id で2回目以降: UPDATE
     * ※ updated_at が存在する前提（無いならこの1行を外してOK）
     */
    const sql = `
      INSERT INTO facilities (user_id, name, description, location, service_type)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        location = EXCLUDED.location,
        service_type = EXCLUDED.service_type,
        updated_at = now()
      RETURNING *;
    `;

    const result = await query(sql, [userId, name, description, location, service_type]);

    // INSERT/UPDATEどちらでも返す
    res.status(201).json(formatFacility(result.rows[0]));
  } catch (error: any) {
    logDbError('POST /facilities (upsert)', error, {
      userId: req.user?.id,
      bodyKeys: Object.keys(req.body ?? {}),
    });

    // 衝突系をもう少し分かりやすく返す（必要なら）
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Duplicate key conflict' });
    }

    res.status(500).json({ error: 'Failed to create facility' });
  }
});

export default router;
