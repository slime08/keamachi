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
    // DB縺ｮ 'mon_availability' 縺ｪ縺ｩ繧・'mon' 縺ｫ繝槭ャ繝斐Φ繧ｰ
    const dbKey = `${day}_availability`; 
    const dbValue = facility[dbKey];

    // DB縺ｮ蛟､縺九ｉ繝輔Ο繝ｳ繝医お繝ｳ繝峨・譛溷ｾ・☆繧句､縺ｸ螟画鋤
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
        // 譁ｰ縺励＞繝・・繧ｿ縺ｯ 'open', 'limited', 'closed' 縺ｧ蜈･繧九％縺ｨ繧呈Φ螳・
        // 蜿､縺・ョ繝ｼ繧ｿ繧・ｺ域悄縺帙〓蛟､縺ｯ 'closed' 縺ｫ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ
        availability[day] = dbValue && ['open', 'limited', 'closed'].includes(dbValue) ? dbValue : 'closed';
    }
    
    // 蜈・・蜀鈴聞縺ｪ繧ｭ繝ｼ縺ｯ蜑企勁
    delete facility[dbKey];
  });

  // DB縺ｮ繧ｫ繝ｩ繝蜷阪ｒ繝輔Ο繝ｳ繝医お繝ｳ繝峨・繧ｭ繝｣繝｡繝ｫ繧ｱ繝ｼ繧ｹ縺ｫ蜷医ｏ縺帙ｋ
  return {
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

// 莠区･ｭ謇荳隕ｧ蜿門ｾ・
router.get('/', async (req, res) => {
  try {
    // 蜈ｨ繧ｫ繝ｩ繝繧貞叙蠕励☆繧九ｈ縺・↓繧ｯ繧ｨ繝ｪ繧剃ｿｮ豁｣
    const result = await query('SELECT * FROM facilities ORDER BY created_at DESC');
    
    const facilities = result.rows.map(formatFacility);

    res.json(facilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// 莠区･ｭ謇隧ｳ邏ｰ蜿門ｾ・
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 蜈ｨ繧ｫ繝ｩ繝繧貞叙蠕励☆繧九ｈ縺・↓繧ｯ繧ｨ繝ｪ繧剃ｿｮ豁｣
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

// 莠区･ｭ謇菴懈・ (縺薙・驛ｨ蛻・・螟画峩荳崎ｦ√□縺後∝ｿｵ縺ｮ縺溘ａ險倩ｼ・
router.post('/', authenticate, async (req, res) => {
  try {
    // 譛ｬ譚･縺ｯ繧ゅ▲縺ｨ螟壹￥縺ｮ繧ｫ繝ｩ繝繧貞女縺台ｻ倥￠繧九∋縺阪□縺後∫ｰ｡逡･蛹悶・縺溘ａ迴ｾ迥ｶ邯ｭ謖・
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
