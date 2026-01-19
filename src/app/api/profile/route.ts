/**
 * API Routes pour les profils utilisateur (mémoire contextuelle)
 * GET /api/profile?sessionId=xxx - Récupérer le profil
 * POST /api/profile - Mettre à jour le profil
 */

import { getUserProfile, createOrUpdateProfile, generateProfileContext } from "@/lib/db";

// Récupérer le profil d'un utilisateur
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(sessionId);
    const context = generateProfileContext(profile);

    return Response.json({
      success: true,
      profile,
      context, // Ready-to-use context string for system prompt
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Mettre à jour le profil
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, interests, common_errors, level, summary, incrementMessages } = body;

    if (!sessionId) {
      return Response.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    await createOrUpdateProfile(sessionId, {
      interests,
      common_errors,
      level,
      summary,
      incrementMessages,
    });

    const updatedProfile = await getUserProfile(sessionId);

    return Response.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
