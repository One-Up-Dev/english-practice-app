-- ============================================
-- English Practice App - Database Schema
-- Run this in Neon SQL Editor
-- ============================================

-- Table des sessions (une session = une conversation)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de progression
CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  words_learned TEXT[] DEFAULT '{}',
  mistakes_corrected INTEGER DEFAULT 0,
  quiz_score INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_session ON progress(session_id);

-- ============================================
-- Exemples de requêtes utiles
-- ============================================

-- Voir toutes les sessions
-- SELECT * FROM sessions ORDER BY updated_at DESC;

-- Voir les messages d'une session
-- SELECT * FROM messages WHERE session_id = 'uuid-here' ORDER BY created_at;

-- Voir la progression
-- SELECT * FROM progress WHERE session_id = 'uuid-here';
