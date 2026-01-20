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

export interface UserProfile {
  id: number;
  session_id: string;
  interests: string[];
  common_errors: Record<string, number>; // { "past_tense": 3, "articles": 5 }
  level: "beginner" | "intermediate" | "advanced";
  summary: string | null;
  total_sessions: number;
  total_messages: number;
  created_at: Date;
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

// ============================================
// User Profiles (Contextual Memory)
// ============================================

export async function getUserProfile(sessionId: string): Promise<UserProfile | null> {
  const [profile] = await sql`
    SELECT * FROM user_profiles WHERE session_id = ${sessionId}
  `;
  return profile as UserProfile | null;
}

export async function createOrUpdateProfile(
  sessionId: string,
  updates: {
    interests?: string[];
    common_errors?: Record<string, number>;
    level?: "beginner" | "intermediate" | "advanced";
    summary?: string;
    incrementMessages?: number;
  }
): Promise<void> {
  const existing = await getUserProfile(sessionId);

  if (existing) {
    // Merge interests (add new ones)
    const mergedInterests = updates.interests
      ? [...new Set([...existing.interests, ...updates.interests])]
      : existing.interests;

    // Merge common_errors (add counts)
    const mergedErrors = { ...existing.common_errors };
    if (updates.common_errors) {
      for (const [key, value] of Object.entries(updates.common_errors)) {
        mergedErrors[key] = (mergedErrors[key] || 0) + value;
      }
    }

    await sql`
      UPDATE user_profiles SET
        interests = ${mergedInterests},
        common_errors = ${JSON.stringify(mergedErrors)},
        level = COALESCE(${updates.level || null}, level),
        summary = COALESCE(${updates.summary || null}, summary),
        total_messages = total_messages + ${updates.incrementMessages || 0},
        updated_at = NOW()
      WHERE session_id = ${sessionId}
    `;
  } else {
    await sql`
      INSERT INTO user_profiles (session_id, interests, common_errors, level, summary, total_messages)
      VALUES (
        ${sessionId},
        ${updates.interests || []},
        ${JSON.stringify(updates.common_errors || {})},
        ${updates.level || "beginner"},
        ${updates.summary || null},
        ${updates.incrementMessages || 0}
      )
    `;
  }
}

/**
 * Generate a context string from user profile for injection into system prompt
 */
export function generateProfileContext(profile: UserProfile | null): string {
  if (!profile) {
    return "";
  }

  const lines: string[] = ["USER CONTEXT:"];

  // Interests
  if (profile.interests.length > 0) {
    lines.push(`- Interests: ${profile.interests.join(", ")}`);
  }

  // Common errors (top 3)
  const errorEntries = Object.entries(profile.common_errors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  if (errorEntries.length > 0) {
    const errorStr = errorEntries.map(([err, count]) => `${err} (${count}x)`).join(", ");
    lines.push(`- Common errors: ${errorStr}`);
  }

  // Level
  lines.push(`- Level: ${profile.level}`);

  // Stats
  lines.push(`- Total messages: ${profile.total_messages}`);

  // Summary
  if (profile.summary) {
    lines.push(`- About this learner: ${profile.summary}`);
  }

  // Recommendation
  if (errorEntries.length > 0) {
    const topError = errorEntries[0][0];
    lines.push(`\nFocus on correcting ${topError} errors when appropriate.`);
  }

  return lines.join("\n");
}

// ============================================
// Scenario Progress (Guided Lessons)
// ============================================

export interface ScenarioProgress {
  id: number;
  session_id: string;
  scenario_id: string;
  current_step: number;
  completed: boolean;
  started_at: Date;
  completed_at: Date | null;
}

export async function getScenarioProgress(
  sessionId: string,
  scenarioId: string
): Promise<ScenarioProgress | null> {
  const [progress] = await sql`
    SELECT * FROM scenario_progress
    WHERE session_id = ${sessionId} AND scenario_id = ${scenarioId}
  `;
  return progress as ScenarioProgress | null;
}

export async function updateScenarioProgress(
  sessionId: string,
  scenarioId: string,
  currentStep: number,
  completed: boolean = false
): Promise<void> {
  const existing = await getScenarioProgress(sessionId, scenarioId);

  if (existing) {
    if (completed) {
      await sql`
        UPDATE scenario_progress SET
          current_step = ${currentStep},
          completed = true,
          completed_at = NOW()
        WHERE session_id = ${sessionId} AND scenario_id = ${scenarioId}
      `;
    } else {
      await sql`
        UPDATE scenario_progress SET
          current_step = ${currentStep}
        WHERE session_id = ${sessionId} AND scenario_id = ${scenarioId}
      `;
    }
  } else {
    await sql`
      INSERT INTO scenario_progress (session_id, scenario_id, current_step, completed)
      VALUES (${sessionId}, ${scenarioId}, ${currentStep}, ${completed})
    `;
  }
}

export async function getCompletedScenarios(sessionId: string): Promise<string[]> {
  const results = await sql`
    SELECT scenario_id FROM scenario_progress
    WHERE session_id = ${sessionId} AND completed = true
  `;
  return results.map((r: { scenario_id: string }) => r.scenario_id);
}

export async function getAllScenarioProgress(sessionId: string): Promise<ScenarioProgress[]> {
  const results = await sql`
    SELECT * FROM scenario_progress
    WHERE session_id = ${sessionId}
  `;
  return results as ScenarioProgress[];
}
