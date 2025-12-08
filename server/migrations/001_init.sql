-- Users テーブル
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('facility', 'user')),
  facility_name VARCHAR(255),
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities テーブル
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  service_type VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(255),
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Matching テーブル
CREATE TABLE IF NOT EXISTS matching (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, user_id)
);

-- Conversations テーブル
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  matching_id INTEGER NOT NULL REFERENCES matching(id) ON DELETE CASCADE,
  participant1_id INTEGER NOT NULL REFERENCES users(id),
  participant2_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages テーブル
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews テーブル
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, user_id)
);

-- Matching Suggestions テーブル（AI推奨用）
CREATE TABLE IF NOT EXISTS matching_suggestions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_facilities_user_id ON facilities(user_id);
CREATE INDEX idx_matching_facility_id ON matching(facility_id);
CREATE INDEX idx_matching_user_id ON matching(user_id);
CREATE INDEX idx_conversations_matching_id ON conversations(matching_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_reviews_facility_id ON reviews(facility_id);
CREATE INDEX idx_matching_suggestions_user_id ON matching_suggestions(user_id);
