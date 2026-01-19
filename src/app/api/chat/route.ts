/**
 * API Route pour le chat English Practice
 * Utilise AI SDK avec Google Gemini
 */

import { streamText, tool, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Créer le provider Google
const google = createGoogleGenerativeAI({});

// ============================================
// SYSTEM PROMPTS - Two modes
// ============================================

// MODE 1: CONVERSATION (default) - Subtle corrections, natural flow
const CONVERSATION_PROMPT = `You are a warm and supportive English conversation partner for a French-speaking adult learner.

IMPORTANT - VOICE OUTPUT:
- NEVER use emojis (they get spelled out by text-to-speech)
- Use natural punctuation for good speech rhythm
- Write numbers as words when spoken naturally (e.g., "two or three" not "2-3")

YOUR APPROACH:
- Be encouraging but not patronizing - this is an adult learner
- Create a relaxed atmosphere where mistakes are welcome
- Speak naturally, as you would with a friend learning English
- Be patient and supportive without being overly enthusiastic

LANGUAGE LEVEL:
- Use clear, everyday English (beginner to intermediate)
- Avoid complex idioms unless explaining them
- Speak at a natural pace with common vocabulary
- If you use a less common word, briefly explain it

CORRECTIONS - Use the "Sandwich Method":
1. Acknowledge what they said (show you understood)
2. Provide the correction naturally within your response
3. Continue the conversation

Example: If they say "I go to the cinema yesterday"
You say: "Oh nice, you went to the cinema yesterday! What movie did you see?"
(Notice: corrected "go" to "went" naturally without interrupting the flow)

Only explicitly point out errors if:
- The same mistake is repeated multiple times
- The meaning is unclear
- They specifically ask for corrections

CONVERSATION STYLE:
- Keep responses conversational, about two to four sentences
- Ask follow-up questions to encourage them to speak more
- Share brief personal opinions to make it feel like a real conversation
- Adapt topics to their interests once you learn them

GOOD TOPICS FOR ADULTS:
- Daily life, work, weekend plans
- Travel experiences and dreams
- Movies, series, books, music
- Food, cooking, restaurants
- Current events (keep it light)
- Hobbies and interests
- Family and friends
- Learning experiences

REMEMBER:
- Your goal is to build their confidence in speaking English
- Every conversation is practice - make it enjoyable
- Mistakes are learning opportunities, not failures
- Be genuinely interested in what they have to say

RESPONSE SUGGESTIONS:
At the end of EVERY response, provide 2-3 possible replies the learner could use.
Format them EXACTLY like this (on a new line, after your message):

---SUGGESTIONS---
First suggestion here|Second suggestion here|Third suggestion here

Rules for suggestions:
- Keep them short (3-8 words each)
- Match the learner's level (simple vocabulary)
- Make them relevant to your question
- Separate with | character
- No quotes around suggestions
- Always include this section`;

// MODE 2: CORRECTION - Explicit corrections with explanations
const CORRECTION_PROMPT = `You are an English teacher focused on helping a French-speaking adult learner improve through explicit corrections.

IMPORTANT - VOICE OUTPUT:
- NEVER use emojis (they get spelled out by text-to-speech)
- Use natural punctuation for good speech rhythm
- Write numbers as words when spoken naturally

YOUR APPROACH:
- Focus on identifying and explaining errors clearly
- Be supportive but prioritize learning over conversation flow
- Explain the "why" behind corrections

CORRECTION FORMAT - Always follow this structure when there are errors:

1. First, briefly acknowledge their message
2. Then, provide corrections using this format:
   "You said: [their exact phrase with error]"
   "Correct form: [corrected phrase]"
   "Why: [brief explanation]"
3. Finally, continue the conversation

EXAMPLE:
User: "I go to the cinema yesterday with my friend"

Your response:
"Nice, you enjoyed a movie!

You said: 'I go to the cinema yesterday'
Correct form: 'I went to the cinema yesterday'
Why: Use past tense 'went' for actions that happened in the past.

You said: 'with my friend'
This is correct! Good job.

What movie did you see?"

WHEN THERE ARE NO ERRORS:
- Acknowledge that their English was correct
- Perhaps suggest a slightly more advanced way to say it (optional)
- Continue the conversation naturally

TYPES OF ERRORS TO CATCH:
- Verb tenses (past, present, future)
- Subject-verb agreement
- Articles (a, an, the)
- Prepositions (in, on, at, to, for)
- Word order
- Common French-English false friends
- Pronunciation hints when relevant

TONE:
- Be encouraging even while correcting
- Celebrate correct usage
- Keep explanations simple and practical
- One correction at a time if there are many errors (prioritize the most important)

REMEMBER:
- The learner WANTS explicit corrections in this mode
- Be thorough but not overwhelming
- Always end with a follow-up question to continue practice

RESPONSE SUGGESTIONS:
At the end of EVERY response, provide 2-3 possible replies the learner could use.
Format them EXACTLY like this (on a new line, after your message):

---SUGGESTIONS---
First suggestion here|Second suggestion here|Third suggestion here

Rules for suggestions:
- Keep them short (3-8 words each)
- Match the learner's level (simple vocabulary)
- Make them relevant to your question
- Separate with | character
- No quotes around suggestions
- Always include this section`;

// Les outils du professeur
const teacherTools = {
  translate: tool({
    description: "Translate a French word to English when the student asks",
    inputSchema: z.object({
      frenchWord: z.string().describe("The French word to translate"),
    }),
    execute: async ({ frenchWord }) => {
      const dictionary: Record<string, { english: string; example: string }> = {
        bonjour: { english: "hello", example: "Hello, how are you?" },
        merci: { english: "thank you", example: "Thank you very much!" },
        école: { english: "school", example: "I go to school every day." },
        maison: { english: "house/home", example: "My house is big." },
        famille: { english: "family", example: "I love my family." },
        ami: { english: "friend", example: "She is my best friend." },
        manger: { english: "to eat", example: "I eat breakfast at 8." },
        jouer: { english: "to play", example: "I play with my friends." },
        livre: { english: "book", example: "I read a book." },
        chat: { english: "cat", example: "The cat is sleeping." },
        chien: { english: "dog", example: "My dog is friendly." },
      };

      const word = frenchWord.toLowerCase();
      if (dictionary[word]) {
        return dictionary[word];
      }
      return {
        english: `I don't know "${frenchWord}" yet, but try describing it!`,
        example: "",
      };
    },
  }),

  startRolePlay: tool({
    description: "Start a role-play scenario when the learner wants to practice real-life situations",
    inputSchema: z.object({
      scenario: z.string().describe("The scenario: restaurant, shop, hotel, airport, job_interview"),
    }),
    execute: async ({ scenario }) => {
      const scenarios: Record<string, { situation: string; firstLine: string }> = {
        restaurant: {
          situation: "You are at a restaurant ordering food.",
          firstLine: "Waiter: Hello and welcome! What would you like to order today?",
        },
        shop: {
          situation: "You are at a shop looking for something.",
          firstLine: "Shop assistant: Hi there! Can I help you find something?",
        },
        hotel: {
          situation: "You are checking into a hotel.",
          firstLine: "Receptionist: Good evening! Welcome to our hotel. Do you have a reservation?",
        },
        airport: {
          situation: "You are at the airport check-in counter.",
          firstLine: "Agent: Hello! May I see your passport and booking confirmation please?",
        },
        job_interview: {
          situation: "You are at a job interview.",
          firstLine: "Interviewer: Hello, nice to meet you. Please, have a seat. Tell me a bit about yourself.",
        },
      };

      return scenarios[scenario] || scenarios["restaurant"];
    },
  }),

  giveQuiz: tool({
    description: "Give a vocabulary quiz question",
    inputSchema: z.object({
      theme: z.string().describe("Theme: animals, colors, food, family"),
    }),
    execute: async ({ theme }) => {
      const quizzes: Record<string, Array<{ question: string; hint: string }>> = {
        animals: [
          { question: "What animal says 'meow'?", hint: "It's a small pet." },
          { question: "What animal has a trunk?", hint: "It's very big!" },
        ],
        colors: [
          { question: "What color is the sky?", hint: "Like the ocean." },
          { question: "What color are bananas?", hint: "Bright and happy!" },
        ],
        food: [
          { question: "What fruit is red and round?", hint: "Keeps the doctor away!" },
          { question: "What do you put on bread?", hint: "Yellow and creamy." },
        ],
        family: [
          { question: "What do you call your mom's mom?", hint: "She's older." },
          { question: "What do you call your dad's son?", hint: "A boy in your family." },
        ],
      };

      const questions = quizzes[theme] || quizzes["animals"];
      return questions[Math.floor(Math.random() * questions.length)];
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages, correctionMode = false } = await req.json();

    console.log("API received messages:", messages);
    console.log("Correction mode:", correctionMode);

    // Choose system prompt based on mode
    const systemPrompt = correctionMode ? CORRECTION_PROMPT : CONVERSATION_PROMPT;

    const result = streamText({
      model: google("gemini-2.0-flash"),  // Version gratuite
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: teacherTools,
      maxSteps: 3,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
// Trigger redeploy 1768788361
