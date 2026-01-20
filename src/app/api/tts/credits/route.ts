import { NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const LOW_CREDITS_THRESHOLD = 0.1; // 10% remaining = low credits warning
const MIN_CREDITS_FOR_ELEVENLABS = 100; // Minimum characters to use ElevenLabs

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

    // Check if API key is configured (not empty or placeholder)
    if (!apiKey || apiKey === '' || apiKey.startsWith('sk_your') || apiKey === 'your_api_key_here') {
      return NextResponse.json({
        success: true,
        configured: false,
        available: false,
        remaining: 0,
        limit: 0,
        percentUsed: 100,
        lowCredits: false,
        resetDate: null,
      });
    }

    // Fetch subscription info from ElevenLabs
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Could be invalid key OR missing permissions (user_read)
        // If the key works for TTS but not for subscription read, assume it's valid
        // and return "available" so TTS will be attempted
        return NextResponse.json({
          success: true,
          configured: true,
          available: true, // Assume available, TTS will fallback if it fails
          remaining: -1,   // Unknown
          limit: -1,       // Unknown
          percentUsed: -1, // Unknown
          lowCredits: false,
          resetDate: null,
          permissionLimited: true, // Flag to indicate we can't read credits
        });
      }

      return NextResponse.json({
        success: false,
        error: `ElevenLabs API error: ${response.status}`,
        configured: true,
        available: false,
      });
    }

    const subscription = await response.json();

    // Calculate credits info
    const characterCount = subscription.character_count || 0;
    const characterLimit = subscription.character_limit || 0;
    const remaining = Math.max(0, characterLimit - characterCount);
    const percentUsed = characterLimit > 0 ? characterCount / characterLimit : 1;
    const percentRemaining = 1 - percentUsed;
    const lowCredits = percentRemaining <= LOW_CREDITS_THRESHOLD;
    const available = remaining >= MIN_CREDITS_FOR_ELEVENLABS;

    // Parse reset date
    let resetDate: string | null = null;
    if (subscription.next_character_count_reset_unix) {
      resetDate = new Date(subscription.next_character_count_reset_unix * 1000).toISOString();
    }

    return NextResponse.json({
      success: true,
      configured: true,
      available,
      remaining,
      limit: characterLimit,
      used: characterCount,
      percentUsed: Math.round(percentUsed * 100),
      lowCredits,
      resetDate,
      tier: subscription.tier || 'unknown',
    });
  } catch (error) {
    console.error('Credits check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check credits',
        configured: !!process.env.ELEVENLABS_API_KEY,
        available: false,
      },
      { status: 500 }
    );
  }
}
