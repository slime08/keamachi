-- 003_fix_availability_data.sql

-- フロントエンドのモックデータとDBのデータを一致させる

-- ケアホーム山田 (id=2) の月曜を 'closed' に
UPDATE facilities SET mon_availability = 'closed' WHERE name = 'ケアホーム山田';

-- デイサービス太陽 (id=3) の木曜を 'closed' に
UPDATE facilities SET thu_availability = 'closed' WHERE name = 'デイサービス太陽';

-- 'circle' などの古い値を新しい値に変換
UPDATE facilities SET mon_availability = 'open' WHERE mon_availability = 'circle';
UPDATE facilities SET tue_availability = 'open' WHERE tue_availability = 'circle';
UPDATE facilities SET wed_availability = 'open' WHERE wed_availability = 'circle';
UPDATE facilities SET thu_availability = 'open' WHERE thu_availability = 'circle' AND name != 'デイサービス太陽'; -- 上で更新したものを除外
UPDATE facilities SET fri_availability = 'open' WHERE fri_availability = 'circle';
UPDATE facilities SET sat_availability = 'open' WHERE sat_availability = 'circle';
UPDATE facilities SET sun_availability = 'open' WHERE sun_availability = 'circle';
