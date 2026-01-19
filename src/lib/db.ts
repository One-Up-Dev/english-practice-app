/**
 * Database connection for Neon Postgres
 * English Practice App - Persistance des conversations
 */

import { neon } from "@neondatabase/serverless";

// Create database connection
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Types pour la base de données
export interface Session {
  id: string;
  student_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: Date;
}

export interface Progress {
  id: number;
  session_id: string;
  words_learned: string[];
  mistakes_corrected: number;
  quiz_score: number;
  total_messages: number;
  updated_at: Date;
}

// ============================================
// Sessions
// ============================================

export async function createSession(studentName?: string): Promise<string> {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO sessions (id, student_name)
    VALUES (${id}, ${studentName || null})
  `;
  return id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const [session] = await sql`
    SELECT * FROM sessions WHERE id = ${sessionId}
  `;
  return session as Session | null;
}

// ============================================
// Messages
// ============================================

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  await sql`
    INSERT INTO messages (session_id, role, content)
    VALUES (${sessionId}, ${role}, ${content})
  `;

  // Update session timestamp
  await sql`
    UPDATE sessions SET updated_at = NOW() WHERE id = ${sessionId}
  `;
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  const messages = await sql`
    SELECT * FROM messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
  return messages as Message[];
}

// ============================================
// Progress
// ============================================

export async function updateProgress(
  sessionId: string,
  wordsLearned?: string[],
  mistakesCorrected?: number,
  quizScore?: number
): Promise<void> {
  // Check if progress exists
  const [existing] = await sql`
    SELECT * FROM progress WHERE session_id = ${sessionId}
  `;

  if (existing) {
    // Update existing
    await sql`
      UPDATE progress SET
        words_learned = COALESCE(${wordsLearned || null}, words_learned),
        mistakes_corrected = mistakes_corrected + COALESCE(${mistakesCorrected || 0}, 0),
        quiz_score = quiz_score + COALESCE(${quizScore || 0}, 0),
        total_messages = total_messages + 1,
        updated_at = NOW()
      WHERE session_id = ${sessionId}
    `;
  } else {
    // Create new
    await sql`
      INSERT INTO progress (session_id, words_learned, mistakes_corrected, quiz_score, total_messages)
      VALUES (${sessionId}, ${wordsLearned || []}, ${mistakesCorrected || 0}, ${quizScore || 0}, 1)
    `;
  }
}

export async function getProgress(sessionId: string): Promise<Progress | null> {
  const [progress] = await sql`
    SELECT * FROM progress WHERE session_id = ${sessionId}
  `;
  return progress as Progress | null;
}
