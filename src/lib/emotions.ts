/**
 * Emotion Tags System
 *
 * The AI uses emotion tags like <laugh>, <excited>, etc. to express emotions.
 * These tags are stripped from the displayed text but can be used for:
 * - Playing sound effects
 * - Triggering animations
 * - Changing avatar expressions
 */

// All supported emotion tags
export const EMOTION_TAGS = [
  'laugh',
  'chuckle',
  'giggle',
  'sigh',
  'excited',
  'surprised',
  'curious',
  'thinking',
  'empathetic',
  'proud',
  'playful',
  'warm',
  'impressed',
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];

// Regex to match emotion tags: <emotion> or <emotion/>
const EMOTION_REGEX = new RegExp(
  `<(${EMOTION_TAGS.join('|')})\s*\\/?>`,
  'gi'
);

export interface ParsedMessage {
  /** The text with emotion tags removed */
  cleanText: string;
  /** List of emotions found in the message, in order */
  emotions: EmotionTag[];
}

/**
 * Parse a message to extract emotion tags and return clean text
 *
 * @example
 * parseEmotions("<laugh> Ha! That's hilarious!")
 * // Returns: { cleanText: "Ha! That's hilarious!", emotions: ["laugh"] }
 *
 * @example
 * parseEmotions("<excited> Oh wow! <proud> Your English is great!")
 * // Returns: { cleanText: "Oh wow! Your English is great!", emotions: ["excited", "proud"] }
 */
export function parseEmotions(text: string): ParsedMessage {
  const emotions: EmotionTag[] = [];

  // Find all emotion tags
  let match;
  const regex = new RegExp(EMOTION_REGEX.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    const emotion = match[1].toLowerCase() as EmotionTag;
    if (EMOTION_TAGS.includes(emotion)) {
      emotions.push(emotion);
    }
  }

  // Remove emotion tags from text and clean up extra whitespace
  const cleanText = text
    .replace(EMOTION_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { cleanText, emotions };
}

/**
 * Strip emotion tags and clean text for TTS (text-to-speech)
 * Removes:
 * - Emotion tags like <laugh>, <excited>
 * - Markdown formatting: **bold**, *italic*, ***bold italic***
 * - Action descriptions: *laughs*, *smiles*
 * - Role labels: "Waiter:", "Emma:"
 */
export function stripEmotions(text: string): string {
  let cleanText = parseEmotions(text).cleanText;

  // Remove markdown bold/italic while keeping the text inside
  // Order matters: handle *** first, then **, then *
  cleanText = cleanText
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')  // ***bold italic*** → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')       // **bold** → text
    .replace(/\*([^*]+)\*/g, '$1')           // *italic* or *action* → text
    .replace(/\*/g, '')                       // Remove any remaining lone asterisks

  // Remove role labels at the start of lines (Waiter:, Emma:, Doctor:, etc.)
  cleanText = cleanText
    .replace(/^[A-Z][a-z]+:\s*/gm, '')       // "Waiter: Hello" → "Hello"

  // Clean up extra whitespace
  cleanText = cleanText
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText;
}

/**
 * Get the primary emotion from a message (first one found)
 */
export function getPrimaryEmotion(text: string): EmotionTag | null {
  const { emotions } = parseEmotions(text);
  return emotions[0] || null;
}
