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
      name: 'サンシャイン介護センター',
      location: '譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ逾槫ｮｮ蜑・-1-1',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-1234-5678',
      email: 'info@sunshine-care.jp',
      website: 'https://sunshine-care.jp',
      image_url: '/keamachi/1.png',
      description: '都心で手厚い介護サービスを提供しています。きめ細やかなサポートで、お一人お一人のニーズに合わせたサービスを提供いたします。',
      capacity: '定員30名',
      operating_hours: '9:00 - 18:00',
      rating: 4.8,
      reviews: 24,
      availability: getRandomAvailability()
    },
    {
      id: 2,
      user_id: 1,
      name: 'ケアホーム山田',
      location: '譚ｱ莠ｬ驛ｽ譁ｰ螳ｿ蛹ｺ隘ｿ譁ｰ螳ｿ2-1-1',
      serviceType: '繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝', // service_type -> serviceType
      phone: '03-2345-6789',
      email: 'contact@carehome-yamada.jp',
      website: 'https://carehome-yamada.jp',
      image_url: '/keamachi/2.png',
      description: '自然豊かな環境のグループホームです。地域に根ざした手厚いケアを提供しています。',
      services: ['24時間対応の介護', '送迎相談', 'レクリエーション'],
      capacity: '定員8名',
      operating_hours: '24時間',
      rating: 4.6,
      reviews: 18,
      availability: getRandomAvailability()
    },
    {
      id: 3,
      user_id: 1,
      name: 'デイサービス太陽',
      location: '譚ｱ莠ｬ驛ｽ貂玖ｰｷ蛹ｺ莉｣縲・惠1-1-1',
      serviceType: '繝・う繧ｵ繝ｼ繝薙せ', // service_type -> serviceType
      phone: '03-3456-7890',
      email: 'info@dayservice-taiyou.jp',
      website: 'https://dayservice-taiyou.jp',
      image_url: '/keamachi/3.png',
      description: '日中の介護・レクリエーションサービスを提供しています。活動を通じて笑顔と活力を生み出します。',
      capacity: '定員30名',
      operating_hours: '8:30 - 17:30',
      rating: 4.9,
      reviews: 32,
      availability: getRandomAvailability()
    },
    {
      id: 4,
      user_id: 1,
      name: '希望リハビリテーション病院',
      location: '逾槫･亥ｷ晉恁讓ｪ豬懷ｸょ漉蛹ｺ1-2-3',
      serviceType: '閠∝▼譁ｽ險ｭ', // service_type -> serviceType
      phone: '045-1111-2222',
      email: 'info@kibou-rehab.jp',
      website: 'https://kibou-rehab.jp',
      image_url: '/keamachi/4.png',
      description: '送迎と専門医が在籍するリハビリテーション病院。最新の設備で早期回復を目指します。',
      capacity: '定員40名',
      staff_count: '45名',
      operating_hours: '8:00 - 19:00',
      rating: 4.5,
      reviews: 15,
      availability: getRandomAvailability()
    },
    {
      id: 5,
      user_id: 1,
      name: 'みらい相談センターライト',
      location: '蝓ｼ邇臥恁縺輔＞縺溘∪蟶ゆｸｭ螟ｮ蛹ｺ3-2-1',
      serviceType: '髫懷ｮｳ遖冗･・, // service_type -> serviceType
      phone: '048-2222-3333',
      email: 'support@light-center.jp',
      website: 'https://light-center.jp',
      image_url: '/keamachi/5.png',
      description: '発達相談と自立支援サービスを提供。個別支援計画でサポートします。',
      services: ['発達相談支援', '居宅介護支援', '通所支援'],
      capacity: '定員20名',
      staff_count: '18名',
      operating_hours: '9:00 - 18:00',
      rating: 4.7,
      reviews: 12,
      availability: getRandomAvailability()
    },
    {
      id: 6,
      user_id: 1,
      name: '児童発達支援クローバー',
      location: '蜊・痩逵瑚飴讖句ｸょ燕蜴溯･ｿ2-8-5',
      serviceType: '蜈千ｫ･遖冗･・, // service_type -> serviceType
      phone: '047-3333-4444',
      email: 'kids@kidshome.jp',
      website: 'https://kidshome.jp',
      image_url: '/keamachi/6.png',
      description: '放課後等デイサービスと児童発達支援を提供。お子様の成長をサポートします。',
      services: ['放課後デイサービス', 'グループ活動', '個別支援計画'],
      capacity: '定員15名',
      staff_count: '14名',
      operating_hours: '9:00 - 17:00',
      rating: 4.8,
      reviews: 20,
      availability: getRandomAvailability()
    },
    {
      id: 7,
      user_id: 1,
      name: 'ナイトケアつばさ',
      location: '譚ｱ莠ｬ驛ｽ貂ｯ蛹ｺ闃晏・蝨・-1-1',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-4444-5555',
      email: 'night@tsubasa-care.jp',
      website: 'https://tsubasa-care.jp',
      image_url: '/keamachi/7.png',
      description: '夜間専門の介護サービスに対応。安心して夜間も過ごせるサポートを提供します。',
      services: ['夜間専門介護', '緊急時対応', '見守り'],
      capacity: '介護者40名/日',
      staff_count: '22名',
      operating_hours: '18:00 - 9:00',
      rating: 4.2,
      reviews: 8,
      availability: getRandomAvailability()
    },
    {
      id: 8,
      user_id: 1,
      name: 'ひかりデイサービス',
      location: '逾槫･亥ｷ晉恁蟾晏ｴ主ｸゆｸｭ蜴溷玄2-4-6',
      serviceType: '繝・う繧ｵ繝ｼ繝薙せ', // service_type -> serviceType
      phone: '044-5555-6666',
      email: 'day@hikari-center.jp',
      website: 'https://hikari-center.jp',
      image_url: '/keamachi/8.png',
      description: 'レクリエーションと機能訓練を取り入れた、明るい雰囲気のデイサービスです。',
      services: ['地域交流支援', '送迎', '個別活動支援'],
      capacity: '定員25名',
      staff_count: '20名',
      operating_hours: '8:30 - 17:30',
      rating: 4.4,
      reviews: 10,
      availability: getRandomAvailability()
    },
    {
      id: 9,
      user_id: 1,
      name: 'サンデーケア虹',
      location: '蜊・痩逵悟鴻闡牙ｸゆｸｭ螟ｮ蛹ｺ7-3-2',
      serviceType: '繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝', // service_type -> serviceType
      phone: '043-6666-7777',
      email: 'info@sunday-niji.jp',
      website: 'https://sunday-niji.jp',
      image_url: '/keamachi/gazo1.png',
      description: '週末も利用できるグループホーム。専門スタッフが24時間体制でサポートします。',
      services: ['24時間介護', '週末レクリエーション', '送迎相談'],
      capacity: '定員12名',
      staff_count: '10名',
      operating_hours: '24時間',
      rating: 4.3,
      reviews: 6,
      availability: getRandomAvailability()
    },
    {
      id: 10,
      user_id: 1,
      name: 'みどりケアステーション',
      location: '譚ｱ莠ｬ驛ｽ荳也伐隹ｷ蛹ｺ鬧呈ｲ｢4-5-6',
      serviceType: '險ｪ蝠丈ｻ玖ｭｷ', // service_type -> serviceType
      phone: '03-7777-8888',
      email: 'home@midoricare.jp',
      website: 'https://midoricare.jp',
      image_url: '/keamachi/gazo1.png',
      description: 'ICTを活用したトータルケアを提供。在宅介護と通所介護の融合で最適なサポートを実現します。',
      services: ['訪問介護', '訪問看護', 'リハビリテーション'],
      capacity: '介護者60名/日',
      staff_count: '28名',
      operating_hours: '8:00 - 20:00',
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
