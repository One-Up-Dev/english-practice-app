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

    // Créer les index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_progress_session ON progress(session_id)
    `;

    return Response.json({
      success: true,
      message: "Database tables created successfully!",
      tables: ["sessions", "messages", "progress"],
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
