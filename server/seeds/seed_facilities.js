import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Import bcrypt

dotenv.config();

const getDbConfig = () => {
  if (process.env.SUPABASE_URL) {
    console.log("Using SUPABASE_URL for database connection for seeding.");
    return { connectionString: process.env.SUPABASE_URL + "?sslmode=require" };
  } else if (process.env.POSTGRES_URL) {
    console.log("Using POSTGRES_URL (Vercel Postgres) for database connection for seeding.");
    return { connectionString: process.env.POSTGRES_URL + "?sslmode=require" };
  } else {
    console.log("Using local .env variables for database connection for seeding.");
    return {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'care_matching'
    };
  }
};

const pool = new Pool(getDbConfig());

const availabilityOptions = ['open', 'limited', 'closed'];
const getRandomAvailability = () => {
    const availability = {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    for (const day of days) {
        availability[day] = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
    }
    return availability;
};

const facilityData = [
    {
      id: 1,
      user_id: 1, // Assuming a user with id 1 exists and is a facility owner
      name: '繧ｵ繝ｳ繧ｷ繝｣繧､繝ｳ遖冗･峨そ繝ｳ繧ｿ繝ｼ',
      location: '譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ逾槫ｮｮ蜑・-1-1',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-1234-5678',
      email: 'info@sunshine-care.jp',
      website: 'https://sunshine-care.jp',
      image_url: '/keamachi/1.png',
      description: '鬮倬ｽ｢閠・髄縺代・險ｪ蝠丈ｻ玖ｭｷ繧ｵ繝ｼ繝薙せ繧呈署萓帙＠縺ｦ縺・∪縺吶らｵ碁ｨ楢ｱ雁ｯ後↑繧ｹ繧ｿ繝・ヵ縺悟茜逕ｨ閠・ｧ倥・繝九・繧ｺ縺ｫ蜷医ｏ縺帙◆繧ｵ繝ｼ繝薙せ繧呈署萓帙＞縺溘＠縺ｾ縺吶・,
      services: ['霄ｫ菴謎ｻ玖ｭｷ', '逕滓ｴｻ謠ｴ蜉ｩ', '逶ｸ隲・・謾ｯ謠ｴ'],
      capacity: '蛻ｩ逕ｨ閠・0蜷・,
      staff_count: '25蜷・,
      operating_hours: '9:00・・8:00',
      rating: 4.8,
      reviews: 24,
      availability: getRandomAvailability()
    },
    {
      id: 2,
      user_id: 1,
      name: '繧ｱ繧｢繝帙・繝螻ｱ逕ｰ',
      location: '譚ｱ莠ｬ驛ｽ譁ｰ螳ｿ蛹ｺ隘ｿ譁ｰ螳ｿ2-1-1',
      serviceType: '繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝', // service_type -> serviceType
      phone: '03-2345-6789',
      email: 'contact@carehome-yamada.jp',
      website: 'https://carehome-yamada.jp',
      image_url: '/keamachi/2.png',
      description: '隱咲衍逞・ｯｾ蠢懊・繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝縺ｧ縺吶ょｮｶ蠎ｭ逧・↑髮ｰ蝗ｲ豌励・荳ｭ縺ｧ縲∝ｰる摩逧・↑繧ｱ繧｢繧呈署萓帙＠縺ｦ縺・∪縺吶・,
      services: ['24譎る俣菴灘宛縺ｮ莉玖ｭｷ', '蛹ｻ逋らｮ｡逅・, '繝ｬ繧ｯ繝ｪ繧ｨ繝ｼ繧ｷ繝ｧ繝ｳ'],
      capacity: '蛻ｩ逕ｨ閠・蜷・,
      staff_count: '8蜷・,
      operating_hours: '24譎る俣',
      rating: 4.6,
      reviews: 18,
      availability: getRandomAvailability()
    },
    {
      id: 3,
      user_id: 1,
      name: '繝・う繧ｵ繝ｼ繝薙せ螟ｪ髯ｽ',
      location: '譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ莉｣縲・惠1-1-1',
      serviceType: '繝・う繧ｵ繝ｼ繝薙せ', // service_type -> serviceType
      phone: '03-3456-7890',
      email: 'info@dayservice-taiyou.jp',
      website: 'https://dayservice-taiyou.jp',
      image_url: '/keamachi/3.png',
      description: '譌･荳ｭ縺ｮ莉玖ｭｷ繝ｻ繝ｪ繝上ン繝ｪ繧ｵ繝ｼ繝薙せ繧呈署萓帙＠縺ｦ縺・∪縺吶ょ茜逕ｨ閠・ｧ倥・讖溯・邯ｭ謖√→逕溘″縺後＞縺･縺上ｊ繧偵し繝昴・繝医＠縺ｾ縺吶・,
      services: ['譌･荳ｭ縺ｮ莉玖ｭｷ', '繝ｪ繝上ン繝ｪ繝・・繧ｷ繝ｧ繝ｳ', '譬・､顔ｮ｡逅・],
      capacity: '蛻ｩ逕ｨ閠・0蜷・,
      staff_count: '15蜷・,
      operating_hours: '8:30・・7:30',
      rating: 4.9,
      reviews: 32,
      availability: getRandomAvailability()
    },
    {
      id: 4,
      user_id: 1,
      name: '莉玖ｭｷ閠∝▼譁ｽ險ｭ 蟶梧悍',
      location: '逾槫･亥ｷ晉恁讓ｪ豬懷ｸょ漉蛹ｺ1-2-3',
      serviceType: '閠∝▼譁ｽ險ｭ', // service_type -> serviceType
      phone: '045-1111-2222',
      email: 'info@kibou-rehab.jp',
      website: 'https://kibou-rehab.jp',
      image_url: '/keamachi/4.png',
      description: '蛹ｻ逋ゅ→遖冗･峨′邨ｱ蜷医＆繧後◆繝ｪ繝上ン繝ｪ譁ｽ險ｭ縲ら洒譛溷・謇縺ｫ繧ょｯｾ蠢懊・,
      services: ['繝ｪ繝上ン繝ｪ', '遏ｭ譛溷・謇', '譬・､翫・蜿｣閻斐こ繧｢'],
      capacity: '蛻ｩ逕ｨ閠・0蜷・,
      staff_count: '45蜷・,
      operating_hours: '8:00・・9:00',
      rating: 4.5,
      reviews: 15,
      availability: getRandomAvailability()
    },
    {
      id: 5,
      user_id: 1,
      name: '髫懷ｮｳ閠・髪謠ｴ繧ｻ繝ｳ繧ｿ繝ｼ 繝ｩ繧､繝・,
      location: '蝓ｼ邇臥恁縺輔＞縺溘∪蟶ゆｸｭ螟ｮ蛹ｺ3-2-1',
      serviceType: '髫懷ｮｳ遖冗･・, // service_type -> serviceType
      phone: '048-2222-3333',
      email: 'support@light-center.jp',
      website: 'https://light-center.jp',
      image_url: '/keamachi/5.png',
      description: '蟆ｱ蜉ｴ謾ｯ謠ｴ縺ｨ遉ｾ莨壼ｾｩ蟶ｰ繧偵し繝昴・繝医ょ句挨險育判縺ｧ莨ｴ襍ｰ縺励∪縺吶・,
      services: ['蟆ｱ蜉ｴ謾ｯ謠ｴ', '逕滓ｴｻ險鍋ｷｴ', '逶ｸ隲・髪謠ｴ'],
      capacity: '蛻ｩ逕ｨ閠・0蜷・,
      staff_count: '18蜷・,
      operating_hours: '9:00・・8:00',
      rating: 4.7,
      reviews: 12,
      availability: getRandomAvailability()
    },
    {
      id: 6,
      user_id: 1,
      name: '蜈千ｫ･逋ｺ驕疲髪謠ｴ 繧ｭ繝・ぜ繝帙・繝',
      location: '蜊・痩逵瑚飴讖句ｸょ燕蜴溯･ｿ2-8-5',
      serviceType: '蜈千ｫ･遖冗･・, // service_type -> serviceType
      phone: '047-3333-4444',
      email: 'kids@kidshome.jp',
      website: 'https://kidshome.jp',
      image_url: '/keamachi/6.png',
      description: '逋ｺ驕疲髪謠ｴ繝励Ο繧ｰ繝ｩ繝縺ｨ螳ｶ譌乗髪謠ｴ繧剃ｸ菴薙〒謠蝉ｾ帙・,
      services: ['蛟句挨逋りご', '繧ｰ繝ｫ繝ｼ繝礼凾閧ｲ', '菫晁ｭｷ閠・髪謠ｴ'],
      capacity: '蛻ｩ逕ｨ蜈・5蜷・,
      staff_count: '14蜷・,
      operating_hours: '9:00・・7:00',
      rating: 4.8,
      reviews: 20,
      availability: getRandomAvailability()
    },
    {
      id: 7,
      user_id: 1,
      name: '繝翫う繝医こ繧｢縺､縺ｰ縺・,
      location: '譚ｱ莠ｬ驛ｽ貂ｯ蛹ｺ闃晏・蝨・-1-1',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-4444-5555',
      email: 'night@tsubasa-care.jp',
      website: 'https://tsubasa-care.jp',
      image_url: '/keamachi/7.png',
      description: '螟憺俣蟶ｯ縺ｮ險ｪ蝠丈ｻ玖ｭｷ縺ｫ迚ｹ蛹悶＠縲∵･縺ｪ繧ｵ繝昴・繝医↓繧ょｯｾ蠢懊・,
      services: ['螟憺俣蟾｡蝗・, '謗呈ｳ・・菴謎ｽ榊､画鋤', '隕句ｮ医ｊ'],
      capacity: '險ｪ蝠乗棧 40莉ｶ/譌･',
      staff_count: '22蜷・,
      operating_hours: '18:00・・:00',
      rating: 4.2,
      reviews: 8,
      availability: getRandomAvailability()
    },
    {
      id: 8,
      user_id: 1,
      name: '縺ｲ縺九ｊ繝・う繧ｻ繝ｳ繧ｿ繝ｼ',
      location: '逾槫･亥ｷ晉恁蟾晏ｴ主ｸゆｸｭ蜴溷玄2-4-6',
      serviceType: '繝・う繧ｵ繝ｼ繝薙せ', // service_type -> serviceType
      phone: '044-5555-6666',
      email: 'day@hikari-center.jp',
      website: 'https://hikari-center.jp',
      image_url: '/keamachi/8.png',
      description: '繝ｪ繝上ン繝ｪ縺ｨ繝ｬ繧ｯ繝ｪ繧ｨ繝ｼ繧ｷ繝ｧ繝ｳ繧貞ｙ縺医◆蝨ｰ蝓溷ｯ・捩蝙九ョ繧､縲・,
      services: ['讖溯・險鍋ｷｴ', '騾∬ｿ・, '蜈･豬ｴ謾ｯ謠ｴ'],
      capacity: '蛻ｩ逕ｨ閠・5蜷・,
      staff_count: '20蜷・,
      operating_hours: '8:30・・7:30',
      rating: 4.4,
      reviews: 10,
      availability: getRandomAvailability()
    },
    {
      id: 9,
      user_id: 1,
      name: '繧ｵ繝ｳ繝・・繧ｱ繧｢陌ｹ',
      location: '蜊・痩逵悟鴻闡牙ｸゆｸｭ螟ｮ蛹ｺ7-3-2',
      serviceType: '繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝', // service_type -> serviceType
      phone: '043-6666-7777',
      email: 'info@sunday-niji.jp',
      website: 'https://sunday-niji.jp',
      image_url: '/keamachi/gazo1.png',
      description: '騾ｱ譛ｫ繧ｱ繧｢繝励Ο繧ｰ繝ｩ繝縺ｨ螳ｶ譌丞盾蜉繧､繝吶Φ繝医′蜈・ｮ溘・,
      services: ['24譎る俣莉玖ｭｷ', '騾ｱ譛ｫ繝ｪ繝輔Ξ繝・す繝･', '螳ｶ譌冗嶌隲・],
      capacity: '蛻ｩ逕ｨ閠・2蜷・,
      staff_count: '10蜷・,
      operating_hours: '24譎る俣',
      rating: 4.3,
      reviews: 6,
      availability: getRandomAvailability()
    },
    {
      id: 10,
      user_id: 1,
      name: '縺ｿ縺ｩ繧雁惠螳・こ繧｢繧ｹ繝・・繧ｷ繝ｧ繝ｳ',
      location: '譚ｱ莠ｬ驛ｽ荳也伐隹ｷ蛹ｺ鬧呈ｲ｢4-5-6',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-7777-8888',
      email: 'home@midoricare.jp',
      website: 'https://midoricare.jp',
      image_url: '/keamachi/gazo1.png',
      description: '蝨ｨ螳・函豢ｻ繧偵ヨ繝ｼ繧ｿ繝ｫ繧ｵ繝昴・繝医ゅΜ繝上ン繝ｪ縺ｨ逵玖ｭｷ縺ｮ騾｣謳ｺ縺ｧ螳牙ｿ・ｒ螻翫￠縺ｾ縺吶・,
      services: ['險ｪ蝠丈ｻ玖ｭｷ', '險ｪ蝠冗恚隴ｷ騾｣謳ｺ', '繝ｪ繝上ン繝ｪ逶ｸ隲・],
      capacity: '險ｪ蝠乗棧 60莉ｶ/譌･',
      staff_count: '28蜷・,
      operating_hours: '8:00・・0:00',
      rating: 4.7,
      reviews: 14,
      availability: getRandomAvailability()
    }
  ];

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Start seeding facilities and users...');
    // Use transaction
    await client.query('BEGIN');

    // Clear existing data (order matters due to foreign keys)
    await client.query('DELETE FROM reviews;');
    await client.query('DELETE FROM matching_suggestions;');
    await client.query('DELETE FROM messages;');
    await client.query('DELETE FROM conversations;');
    await client.query('DELETE FROM matching;');
    await client.query('DELETE FROM facilities;');
    await client.query('DELETE FROM users;');

    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE facilities_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE matching_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE conversations_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE messages_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE reviews_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE matching_suggestions_id_seq RESTART WITH 1;');


    // Insert default user 'a@a'
    const hashedPassword = await bcrypt.hash('a', 10); // Hash 'a' with salt rounds of 10
    const defaultUserQuery = `
      INSERT INTO users (id, email, password, name, role, facility_name)
      VALUES (1, 'a@a', $1, 'Test User', 'user', NULL)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role, facility_name = EXCLUDED.facility_name;
    `;
    await client.query(defaultUserQuery, [hashedPassword]);
    console.log('Default user "a@a" seeded.');

    for (const facility of facilityData) {
      const query = `
        INSERT INTO facilities (
          id, user_id, name, description, location, service_type, phone, website, rating,
          email, image_url, services, capacity, staff_count, operating_hours, reviews,
          mon_availability, tue_availability, wed_availability, thu_availability, fri_availability, sat_availability, sun_availability
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
      `;
      const values = [
        facility.id,
        facility.user_id,
        facility.name,
        facility.description,
        facility.location,
        facility.serviceType, // service_type -> serviceType
        facility.phone,
        facility.website,
        facility.rating,
        facility.email,
        facility.image_url,
        facility.services,
        facility.capacity,
        facility.staff_count,
        facility.operating_hours,
        facility.reviews,
        facility.availability.mon,
        facility.availability.tue,
        facility.availability.wed,
        facility.availability.thu,
        facility.availability.fri,
        facility.availability.sat,
        facility.availability.sun,
      ];
      await client.query(query, values);
    }
    
    await client.query('COMMIT');
    console.log('Seeding completed successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
