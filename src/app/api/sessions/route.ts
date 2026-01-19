/**
 * API Routes pour les sessions
 * POST /api/sessions - Créer une nouvelle session
 * GET /api/sessions?id=xxx - Récupérer une session avec ses messages
 */

import { createSession, getSession, getMessages, getProgress } from "@/lib/db";

// Créer une nouvelle session
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentName = body.studentName || null;

    const sessionId = await createSession(studentName);

    return Response.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Récupérer une session avec ses messages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return Response.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return Response.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    const messages = await getMessages(sessionId);
    const progress = await getProgress(sessionId);

    return Response.json({
      success: true,
      session,
      messages,
      progress,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
