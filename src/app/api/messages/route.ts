/**
 * API Route pour sauvegarder les messages
 * POST /api/messages - Sauvegarder un message
 */

import { saveMessage, updateProgress } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { sessionId, role, content } = await req.json();

    if (!sessionId || !role || !content) {
      return Response.json(
        { success: false, error: "sessionId, role, and content are required" },
        { status: 400 }
      );
    }

    await saveMessage(sessionId, role, content);

    // Update progress (increment message count)
    await updateProgress(sessionId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save message error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
