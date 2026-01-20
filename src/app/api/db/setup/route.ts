/**
 * API Route pour initialiser la base de données
 * GET /api/db/setup - Crée les tables si elles n'existent pas
 */

import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Créer la table sessions
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Créer la table messages
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Créer la table progress
    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
        words_learned TEXT[] DEFAULT '{}',
        mistakes_corrected INTEGER DEFAULT 0,
        quiz_score INTEGER DEFAULT 0,
        total_messages INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Créer la table user_profiles pour la mémoire contextuelle
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
        interests TEXT[] DEFAULT '{}',
        common_errors JSONB DEFAULT '{}',
        level VARCHAR(20) DEFAULT 'beginner',
        summary TEXT,
        total_sessions INTEGER DEFAULT 1,
        total_messages INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Créer la table scenario_progress pour le tracking des scénarios guidés
    await sql`
      CREATE TABLE IF NOT EXISTS scenario_progress (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        scenario_id VARCHAR(50) NOT NULL,
        current_step INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        UNIQUE(session_id, scenario_id)
      )
    `;

    // Créer les index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_progress_session ON progress(session_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_session ON user_profiles(session_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_scenario_progress_session ON scenario_progress(session_id)
    `;

    return Response.json({
      success: true,
      message: "Database tables created successfully!",
      tables: ["sessions", "messages", "progress", "user_profiles", "scenario_progress"],
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
