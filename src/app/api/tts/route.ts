import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - calm, natural

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const selectedVoiceId =
      voiceId ||
      process.env.ELEVENLABS_VOICE_ID ||
      DEFAULT_VOICE_ID;

    // Call ElevenLabs TTS API with streaming
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${selectedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    // Handle ElevenLabs errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'ElevenLabs API error';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail?.message || errorJson.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      // Map status codes for fallback detection
      const status = response.status;

      // 401 = unauthorized, 402 = payment required (quota), 429 = rate limited
      if (status === 401 || status === 402 || status === 429) {
        return NextResponse.json(
          {
            error: errorMessage,
            code: status === 402 ? 'QUOTA_EXCEEDED' : status === 429 ? 'RATE_LIMITED' : 'UNAUTHORIZED',
          },
          { status }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status });
    }

    // Stream the audio response back to client
    const audioStream = response.body;

    if (!audioStream) {
      return NextResponse.json(
        { error: 'No audio stream received' },
        { status: 500 }
      );
    }

    // Return streaming response
    return new NextResponse(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS generation failed' },
      { status: 500 }
    );
  }
}
