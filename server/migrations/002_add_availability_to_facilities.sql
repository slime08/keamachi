-- 002_add_availability_to_facilities.sql
ALTER TABLE facilities
ADD COLUMN mon_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN tue_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN wed_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN thu_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN fri_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN sat_availability VARCHAR(10) DEFAULT 'circle',
ADD COLUMN sun_availability VARCHAR(10) DEFAULT 'circle';
