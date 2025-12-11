-- 004_add_more_fields_to_facilities.sql
ALTER TABLE facilities
ADD COLUMN email VARCHAR(255),
ADD COLUMN image_url VARCHAR(255),
ADD COLUMN services TEXT[],
ADD COLUMN capacity VARCHAR(255),
ADD COLUMN staff_count VARCHAR(255),
ADD COLUMN operating_hours VARCHAR(255),
ADD COLUMN reviews INTEGER;
