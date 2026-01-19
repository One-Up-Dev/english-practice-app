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

// System prompt pour le professeur d'anglais
const ENGLISH_TEACHER_PROMPT = `You are a friendly English teacher for a French-speaking student (around 10-12 years old).

YOUR PERSONALITY:
- Patient, encouraging, and fun
- You use emojis to make learning enjoyable 🎉
- You celebrate small victories

YOUR RULES:
1. ALWAYS respond in simple English (beginner/intermediate level)
2. If the student makes a mistake, gently correct them inline
3. Ask follow-up questions to keep the conversation going
4. Adapt your vocabulary to their level
5. Keep responses SHORT (2-3 sentences max)

CORRECTION FORMAT (inline, not separate):
"Great try! In English we say '[correction]' instead of '[error]'. [Continue conversation naturally]"

TOPICS TO DISCUSS:
- Their day, school, hobbies, family, pets, friends
- Favorite movies, games, sports, music
- Dreams, wishes, what they want to be

Remember: Make them WANT to speak English! Be their friend, not just a teacher.`;

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
    description: "Start a role-play scenario when the student wants to practice",
    inputSchema: z.object({
      scenario: z.string().describe("The scenario: restaurant, shop, school"),
    }),
    execute: async ({ scenario }) => {
      const scenarios: Record<string, { situation: string; firstLine: string }> = {
        restaurant: {
          situation: "You are at a restaurant ordering food.",
          firstLine: "🍽️ Waiter: Hello! Welcome! What would you like to eat today?",
        },
        shop: {
          situation: "You are at a toy shop looking for a gift.",
          firstLine: "🏪 Assistant: Hi there! Can I help you find something?",
        },
        school: {
          situation: "It's your first day at a new school.",
          firstLine: "🏫 Teacher: Good morning class! We have a new student. Please say hello!",
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
    const { messages } = await req.json();

    console.log("API received messages:", messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: ENGLISH_TEACHER_PROMPT,
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
