/**
 * Text cleanup utilities for TTS (text-to-speech)
 */

/**
 * Clean text for TTS output
 * Removes:
 * - Markdown formatting: **bold**, *italic*, ***bold italic***
 * - Role labels: "Waiter:", "Emma:"
 *
 * Preserves newlines for correction format parsing.
 */
export function stripForTTS(text: string): string {
  let cleanText = text;

  // Remove markdown bold/italic while keeping the text inside
  // Order matters: handle *** first, then **, then *
  cleanText = cleanText
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')  // ***bold italic*** → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')       // **bold** → text
    .replace(/\*([^*]+)\*/g, '$1')           // *italic* or *action* → text
    .replace(/\*/g, '');                      // Remove any remaining lone asterisks

  // Remove role labels at the start of lines (Waiter:, Emma:, Doctor:, etc.)
  cleanText = cleanText
    .replace(/^[A-Z][a-z]+:\s*/gm, '');      // "Waiter: Hello" → "Hello"

  // Clean up extra spaces/tabs BUT PRESERVE NEWLINES
  cleanText = cleanText
    .replace(/[^\S\n]+/g, ' ')               // Replace spaces/tabs with single space, keep \n
    .replace(/ \n/g, '\n')                   // Remove trailing spaces before newlines
    .replace(/\n /g, '\n')                   // Remove leading spaces after newlines
    .trim();

  return cleanText;
}

// Alias for backwards compatibility
export const stripEmotions = stripForTTS;
