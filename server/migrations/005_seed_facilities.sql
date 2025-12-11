-- 005_seed_facilities.sql
-- Insert 10 sample facility users and facility rows.
-- Adjust fields as needed for your real data.

-- Insert facility users
INSERT INTO users (email, password, name, role, facility_name) VALUES
('facility1@example.com','password','ケアホームやまもと','facility','ケアホームやまもと'),
('facility2@example.com','password','デイサービスひかり','facility','デイサービスひかり'),
('facility3@example.com','password','デイサービスつき','facility','デイサービスつき'),
('facility4@example.com','password','ナーシングホームさくら','facility','ナーシングホームさくら'),
('facility5@example.com','password','訪問介護みどり','facility','訪問介護みどり'),
('facility6@example.com','password','ケアセンターあおい','facility','ケアセンターあおい'),
('facility7@example.com','password','デイサービスそら','facility','デイサービスそら'),
('facility8@example.com','password','ケアハウスはな','facility','ケアハウスはな'),
('facility9@example.com','password','リハビリセンターにじ','facility','リハビリセンターにじ'),
('facility10@example.com','password','サービス付き高齢者住宅もも','facility','サービス付き高齢者住宅もも')
ON CONFLICT (email) DO NOTHING;

-- Insert facilities referencing the users by email
INSERT INTO facilities (user_id, name, description, location, service_type, phone, website, rating, email, image_url, services, capacity, staff_count, operating_hours, reviews, mon_availability, tue_availability, wed_availability, thu_availability, fri_availability, sat_availability, sun_availability)
VALUES
((SELECT id FROM users WHERE email='facility1@example.com'),'ケアホームやまもと','家庭的な雰囲気のケアホーム','東京都品川区','施設系','03-1234-0001','https://example.com/yamamoto',4.4,'info@yamamoto.example','https://placehold.co/400x200',ARRAY['短期入所','介護'], '30','15','9:00-18:00',0, 'open', 'limited', 'open', 'closed', 'open', 'limited', 'closed'),
((SELECT id FROM users WHERE email='facility2@example.com'),'デイサービスひかり','日中の活動が充実したデイサービス','東京都新宿区','デイサービス','03-1234-0002','https://example.com/hikari',4.1,'info@hikari.example','https://placehold.co/400x200',ARRAY['通所介護','送迎'], '25','10','8:30-17:00',0, 'limited', 'open', 'closed', 'open', 'limited', 'open', 'closed'),
((SELECT id FROM users WHERE email='facility3@example.com'),'デイサービスつき','リハビリ重視のデイサービス','神奈川県横浜市','デイサービス','045-123-0003','https://example.com/tsuki',4.3,'info@tsuki.example','https://placehold.co/400x200',ARRAY['リハビリテーション','通所介護'], '20','8','9:00-16:30',0, 'open', 'open', 'limited', 'closed', 'open', 'closed', 'open'),
((SELECT id FROM users WHERE email='facility4@example.com'),'ナーシングホームさくら','医療連携の強いナーシングホーム','埼玉県川越市','施設系','049-123-0004','https://example.com/sakura',4.6,'info@sakura.example','https://placehold.co/400x200',ARRAY['医療対応','看護体制'], '40','25','24時間',0, 'closed', 'limited', 'open', 'open', 'limited', 'open', 'open'),
((SELECT id FROM users WHERE email='facility5@example.com'),'訪問介護みどり','地域密着の訪問介護サービス','千葉県千葉市','訪問介護','043-123-0005','https://example.com/midori',4.0,'info@midori.example','https://placehold.co/400x200',ARRAY['訪問介護','家事支援'], 'N/A','12','8:00-20:00',0, 'limited', 'closed', 'open', 'limited', 'open', 'closed', 'limited'),
((SELECT id FROM users WHERE email='facility6@example.com'),'ケアセンターあおい','多機能型のケアセンター','東京都世田谷区','多機能','03-1234-0006','https://example.com/aoi',4.2,'info@aoi.example','https://placehold.co/400x200',ARRAY['デイサービス','ショートステイ'], '35','18','9:00-18:00',0, 'open', 'limited', 'closed', 'open', 'open', 'open', 'closed'),
((SELECT id FROM users WHERE email='facility7@example.com'),'デイサービスそら','アットホームな雰囲気のデイサービス','神奈川県川崎市','デイサービス','044-123-0007','https://example.com/sora',3.9,'info@sora.example','https://placehold.co/400x200',ARRAY['レクリエーション','食事提供'], '22','9','9:00-17:00',0, 'closed', 'open', 'limited', 'closed', 'limited', 'open', 'open'),
((SELECT id FROM users WHERE email='facility8@example.com'),'ケアハウスはな','穏やかな生活を支えるケアハウス','埼玉県越谷市','ケアハウス','048-123-0008','https://example.com/hana',4.0,'info@hana.example','https://placehold.co/400x200',ARRAY['住宅型','生活支援'], '28','14','24時間',0, 'open', 'closed', 'open', 'limited', 'open', 'limited', 'open'),
((SELECT id FROM users WHERE email='facility9@example.com'),'リハビリセンターにじ','専門リハビリテーションを提供','千葉県柏市','リハビリ','04-123-0009','https://example.com/niji',4.7,'info@niji.example','https://placehold.co/400x200',ARRAY['リハビリ','機能訓練'], '15','10','9:00-18:00',0, 'limited', 'open', 'open', 'open', 'closed', 'open', 'closed'),
((SELECT id FROM users WHERE email='facility10@example.com'),'サービス付き高齢者住宅もも','安心のバリアフリー住宅','東京都板橋区','サ高住','03-1234-0010','https://example.com/momo',4.5,'info@momo.example','https://placehold.co/400x200',ARRAY['居住','生活支援'], '60','30','24時間',0, 'open', 'limited', 'open', 'open', 'limited', 'closed', 'closed')
ON CONFLICT DO NOTHING;
