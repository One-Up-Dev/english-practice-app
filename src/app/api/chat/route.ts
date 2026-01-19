/**
 * API Route pour le chat English Practice
 * Utilise AI SDK avec Google Gemini
 */

import { streamText, tool, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getUserProfile, generateProfileContext } from "@/lib/db";

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

// ============================================
// LEVEL PROMPTS - Adapt language complexity
// ============================================

const LEVEL_PROMPTS = {
  beginner: `
LANGUAGE ADAPTATION FOR BEGINNER:
- Use ONLY the most common 500-1000 words in English
- Keep sentences very short (5-8 words maximum)
- Speak slowly and clearly - imagine they just started learning
- Give LOTS of encouragement and positive feedback
- Correct gently, always praise the attempt first
- Use mainly present tense, introduce past tense slowly
- AVOID idioms, phrasal verbs, and slang completely
- If you must use a new word, explain it immediately
- Use simple grammar structures only
- Repeat key vocabulary to help them remember`,

  intermediate: `
LANGUAGE ADAPTATION FOR INTERMEDIATE:
- Use everyday vocabulary with occasional new words (explain briefly)
- Normal sentence length and structure
- Introduce common idioms and explain them when used
- Balance corrections with conversation flow
- Use all tenses naturally
- Challenge with follow-up questions to make them think
- Can use some phrasal verbs (explain if needed)
- Encourage longer responses from the learner
- Point out nuances between similar words`,

  advanced: `
LANGUAGE ADAPTATION FOR ADVANCED:
- Use rich vocabulary including idioms, phrasal verbs, and colloquialisms
- Complex sentence structures are welcome
- Focus on nuance, register, and style refinement
- Correct subtle errors: articles, prepositions, collocations, word choice
- Discuss abstract and complex topics
- Challenge their reasoning and opinions
- Introduce formal vs informal register differences
- Point out British vs American English variations
- Expect and encourage sophisticated responses`
};

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

  // ============================================
  // NEW TOOLS - Grammar, Pronunciation, Synonyms
  // ============================================

  grammarExplain: tool({
    description: "Explain a grammar rule in detail when the student asks or makes repeated errors. Use this to teach grammar concepts.",
    inputSchema: z.object({
      rule: z.string().describe("The grammar rule to explain: past_simple, present_perfect, articles, prepositions, conditionals, passive_voice, comparatives, question_forms"),
      context: z.string().describe("The sentence or error that triggered this explanation"),
    }),
    execute: async ({ rule, context }) => {
      const grammarRules: Record<string, {
        name: string;
        explanation: string;
        structure: string;
        examples: string[];
        commonMistakes: string;
        frenchTip: string;
      }> = {
        past_simple: {
          name: "Past Simple Tense",
          explanation: "Use the past simple for completed actions in the past. The action is finished.",
          structure: "Subject + verb(ed) OR irregular past form",
          examples: [
            "I walked to school yesterday.",
            "She ate breakfast at 8am.",
            "They went to Paris last summer."
          ],
          commonMistakes: "Using present tense for past actions: 'I go yesterday' instead of 'I went yesterday'",
          frenchTip: "Similar to French passé composé, but simpler - no auxiliary verb needed for most verbs."
        },
        present_perfect: {
          name: "Present Perfect Tense",
          explanation: "Use present perfect for past actions with a connection to now, or for experiences without a specific time.",
          structure: "Subject + have/has + past participle",
          examples: [
            "I have visited London twice.",
            "She has already eaten.",
            "Have you ever tried sushi?"
          ],
          commonMistakes: "Using past simple instead: 'Did you ever try sushi?' instead of 'Have you ever tried sushi?'",
          frenchTip: "Looks like passé composé but usage is different! English uses it for unfinished time periods."
        },
        articles: {
          name: "Articles (a, an, the)",
          explanation: "Use 'a/an' for general or first mention. Use 'the' for specific or already mentioned things.",
          structure: "a + consonant sound, an + vowel sound, the + specific noun",
          examples: [
            "I saw a dog. The dog was brown.",
            "She is an engineer.",
            "The sun is bright today."
          ],
          commonMistakes: "Omitting articles: 'I have car' instead of 'I have a car'",
          frenchTip: "French uses articles more than English. 'I like music' (no article) vs 'J'aime la musique'"
        },
        prepositions: {
          name: "Prepositions of Time and Place",
          explanation: "Prepositions show relationships between words. Time: at, on, in. Place: at, on, in, to.",
          structure: "at (specific time/place), on (days/surfaces), in (months/years/enclosed spaces)",
          examples: [
            "at 5 o'clock, at the station",
            "on Monday, on the table",
            "in January, in the room"
          ],
          commonMistakes: "Wrong preposition: 'in Monday' instead of 'on Monday'",
          frenchTip: "Different from French! 'In the morning' = 'le matin', 'at night' = 'la nuit'"
        },
        conditionals: {
          name: "Conditional Sentences",
          explanation: "Express possibilities and their results. Zero (facts), First (likely), Second (unlikely), Third (past unreal).",
          structure: "If + condition, result / Result if + condition",
          examples: [
            "Zero: If you heat water, it boils.",
            "First: If it rains, I will stay home.",
            "Second: If I won the lottery, I would travel.",
            "Third: If I had studied, I would have passed."
          ],
          commonMistakes: "Mixing tenses: 'If I would have money' instead of 'If I had money'",
          frenchTip: "Second conditional uses past tense like French imparfait in 'si' clauses."
        },
        passive_voice: {
          name: "Passive Voice",
          explanation: "Use passive when the action is more important than who did it, or when the doer is unknown.",
          structure: "Subject + be + past participle (+ by agent)",
          examples: [
            "The cake was eaten.",
            "The book was written by Hemingway.",
            "English is spoken worldwide."
          ],
          commonMistakes: "Forgetting 'be': 'The cake eaten' instead of 'The cake was eaten'",
          frenchTip: "Similar to French passive with être, but used more often in English."
        },
        comparatives: {
          name: "Comparatives and Superlatives",
          explanation: "Compare two things (comparative) or identify the extreme (superlative).",
          structure: "Short adj: -er/-est. Long adj: more/most + adj",
          examples: [
            "She is taller than me.",
            "This is the most beautiful city.",
            "He runs faster than his brother."
          ],
          commonMistakes: "Double comparison: 'more bigger' instead of 'bigger'",
          frenchTip: "Unlike French 'plus grand', short English adjectives change form: big → bigger"
        },
        question_forms: {
          name: "Question Formation",
          explanation: "Form questions using auxiliary verbs (do/does/did) or inverting subject and verb.",
          structure: "Auxiliary + subject + main verb? / Question word + auxiliary + subject + verb?",
          examples: [
            "Do you like coffee?",
            "Where did she go?",
            "Have you finished?"
          ],
          commonMistakes: "Missing auxiliary: 'You like coffee?' instead of 'Do you like coffee?'",
          frenchTip: "Unlike French intonation questions, English usually needs an auxiliary verb."
        }
      };

      const ruleData = grammarRules[rule] || grammarRules["past_simple"];
      return {
        ...ruleData,
        triggeredBy: context
      };
    },
  }),

  pronunciationTip: tool({
    description: "Give pronunciation tips for tricky English words or sounds. Use when the learner asks about pronunciation or might struggle with a word.",
    inputSchema: z.object({
      word: z.string().describe("The word to explain pronunciation for"),
    }),
    execute: async ({ word }) => {
      // Common pronunciation challenges for French speakers
      const pronunciationGuide: Record<string, {
        phonetic: string;
        sounds: string;
        tip: string;
        similarWords: string[];
        frenchTrap: string;
      }> = {
        "the": {
          phonetic: "/ðə/ or /ði/",
          sounds: "The 'th' sound - put your tongue between your teeth and blow air",
          tip: "Use 'thee' before vowel sounds, 'thuh' before consonants",
          similarWords: ["this", "that", "there", "they"],
          frenchTrap: "Don't say 'ze' - the English 'th' doesn't exist in French!"
        },
        "think": {
          phonetic: "/θɪŋk/",
          sounds: "Unvoiced 'th' - tongue between teeth, no vibration",
          tip: "Different from 'the' - this 'th' is softer, like blowing air",
          similarWords: ["thought", "through", "three", "thing"],
          frenchTrap: "Not 'sink' or 'zink' - practice the tongue position"
        },
        "comfortable": {
          phonetic: "/ˈkʌmf.tə.bəl/",
          sounds: "Only 3 syllables! CUMF-ter-bul",
          tip: "The 'or' is silent - don't say 'com-for-table'",
          similarWords: ["vegetable", "reasonable"],
          frenchTrap: "Much shorter than the French 'confortable'"
        },
        "wednesday": {
          phonetic: "/ˈwenz.deɪ/",
          sounds: "WENZ-day - the 'd' in the middle is silent",
          tip: "Only 2 syllables, not 3",
          similarWords: ["February (Feb-yoo-ary)", "library (li-brer-y)"],
          frenchTrap: "Unlike French 'mercredi', English has silent letters"
        },
        "would": {
          phonetic: "/wʊd/",
          sounds: "Sounds exactly like 'wood'",
          tip: "The 'l' is completely silent",
          similarWords: ["could", "should"],
          frenchTrap: "Don't pronounce the 'l' - it's not 'woo-ld'"
        },
        "interesting": {
          phonetic: "/ˈɪn.trə.stɪŋ/",
          sounds: "IN-truh-sting - only 3 syllables in casual speech",
          tip: "The second 'e' often disappears",
          similarWords: ["different", "chocolate", "camera"],
          frenchTrap: "French says all syllables; English often drops them"
        },
        "island": {
          phonetic: "/ˈaɪ.lənd/",
          sounds: "EYE-land - the 's' is silent",
          tip: "Think of it as 'I-land'",
          similarWords: ["isle", "aisle"],
          frenchTrap: "Silent 's' like French 'île' - they share the same origin!"
        },
        "height": {
          phonetic: "/haɪt/",
          sounds: "Rhymes with 'light' and 'right'",
          tip: "The 'ei' makes an 'eye' sound, not 'ee'",
          similarWords: ["weight (WAYT)", "eight (AYT)"],
          frenchTrap: "'ei' in English has many sounds - learn each word"
        },
        "clothes": {
          phonetic: "/kloʊz/",
          sounds: "Sounds almost like 'close' (to shut)",
          tip: "The 'th' is barely pronounced - say 'cloze'",
          similarWords: ["months", "sixths"],
          frenchTrap: "Don't try to pronounce every letter clearly"
        },
        "breakfast": {
          phonetic: "/ˈbrek.fəst/",
          sounds: "BREK-fust - short 'e' sound",
          tip: "Not 'break-fast' - it's compressed into one quick word",
          similarWords: ["cupboard (CUB-erd)", "forehead (FOR-ed)"],
          frenchTrap: "English compounds often change pronunciation"
        }
      };

      const wordLower = word.toLowerCase();

      // Check if we have specific data for this word
      if (pronunciationGuide[wordLower]) {
        return pronunciationGuide[wordLower];
      }

      // Generic response for words not in our guide
      return {
        phonetic: `Look up: ${word}`,
        sounds: "Listen carefully and repeat",
        tip: "Break the word into syllables and practice each part",
        similarWords: [],
        frenchTrap: "Pay attention to silent letters and stress patterns - they differ from French"
      };
    },
  }),

  synonymSuggest: tool({
    description: "Suggest synonyms to help expand vocabulary. Use when the learner uses basic words repeatedly or asks for alternatives.",
    inputSchema: z.object({
      word: z.string().describe("The word to find synonyms for"),
      context: z.string().describe("The sentence context where the word was used"),
    }),
    execute: async ({ word, context }) => {
      const synonyms: Record<string, {
        basic: string;
        alternatives: Array<{ word: string; level: string; nuance: string }>;
        exampleUpgrade: string;
      }> = {
        "good": {
          basic: "good",
          alternatives: [
            { word: "great", level: "beginner", nuance: "more enthusiastic" },
            { word: "excellent", level: "intermediate", nuance: "formal, high quality" },
            { word: "wonderful", level: "intermediate", nuance: "emotional, delightful" },
            { word: "outstanding", level: "advanced", nuance: "exceptionally good" },
            { word: "superb", level: "advanced", nuance: "extremely impressive" }
          ],
          exampleUpgrade: "'The food was good' → 'The food was delicious'"
        },
        "bad": {
          basic: "bad",
          alternatives: [
            { word: "terrible", level: "beginner", nuance: "very bad" },
            { word: "awful", level: "intermediate", nuance: "extremely bad, unpleasant" },
            { word: "dreadful", level: "intermediate", nuance: "causing fear or shock" },
            { word: "appalling", level: "advanced", nuance: "shockingly bad" },
            { word: "atrocious", level: "advanced", nuance: "extremely bad quality" }
          ],
          exampleUpgrade: "'The weather was bad' → 'The weather was terrible'"
        },
        "big": {
          basic: "big",
          alternatives: [
            { word: "large", level: "beginner", nuance: "more formal than big" },
            { word: "huge", level: "beginner", nuance: "very big" },
            { word: "enormous", level: "intermediate", nuance: "extremely large" },
            { word: "massive", level: "intermediate", nuance: "heavy and large" },
            { word: "immense", level: "advanced", nuance: "extremely large, vast" }
          ],
          exampleUpgrade: "'It's a big house' → 'It's an enormous house'"
        },
        "small": {
          basic: "small",
          alternatives: [
            { word: "little", level: "beginner", nuance: "often affectionate" },
            { word: "tiny", level: "beginner", nuance: "very small" },
            { word: "compact", level: "intermediate", nuance: "small but efficient" },
            { word: "miniature", level: "intermediate", nuance: "very small version" },
            { word: "minuscule", level: "advanced", nuance: "extremely tiny" }
          ],
          exampleUpgrade: "'A small apartment' → 'A cozy/compact apartment'"
        },
        "happy": {
          basic: "happy",
          alternatives: [
            { word: "glad", level: "beginner", nuance: "pleased about something" },
            { word: "delighted", level: "intermediate", nuance: "very pleased" },
            { word: "thrilled", level: "intermediate", nuance: "extremely excited and happy" },
            { word: "overjoyed", level: "advanced", nuance: "extremely happy" },
            { word: "ecstatic", level: "advanced", nuance: "overwhelmingly happy" }
          ],
          exampleUpgrade: "'I'm happy to help' → 'I'm delighted to help'"
        },
        "sad": {
          basic: "sad",
          alternatives: [
            { word: "unhappy", level: "beginner", nuance: "not happy" },
            { word: "upset", level: "beginner", nuance: "sad and slightly angry" },
            { word: "miserable", level: "intermediate", nuance: "very unhappy" },
            { word: "heartbroken", level: "intermediate", nuance: "extremely sad about loss" },
            { word: "devastated", level: "advanced", nuance: "overwhelmingly sad" }
          ],
          exampleUpgrade: "'I feel sad' → 'I feel down/blue'"
        },
        "nice": {
          basic: "nice",
          alternatives: [
            { word: "lovely", level: "beginner", nuance: "pleasant, attractive" },
            { word: "pleasant", level: "intermediate", nuance: "enjoyable, agreeable" },
            { word: "delightful", level: "intermediate", nuance: "charming, very pleasant" },
            { word: "charming", level: "advanced", nuance: "attractively pleasant" },
            { word: "exquisite", level: "advanced", nuance: "extremely beautiful/refined" }
          ],
          exampleUpgrade: "'A nice day' → 'A lovely/beautiful day'"
        },
        "interesting": {
          basic: "interesting",
          alternatives: [
            { word: "fascinating", level: "intermediate", nuance: "extremely interesting" },
            { word: "intriguing", level: "intermediate", nuance: "arousing curiosity" },
            { word: "captivating", level: "advanced", nuance: "holding attention completely" },
            { word: "compelling", level: "advanced", nuance: "powerfully interesting" },
            { word: "riveting", level: "advanced", nuance: "completely absorbing" }
          ],
          exampleUpgrade: "'An interesting book' → 'A fascinating/captivating book'"
        },
        "said": {
          basic: "said",
          alternatives: [
            { word: "told", level: "beginner", nuance: "said to someone specific" },
            { word: "replied", level: "beginner", nuance: "said in response" },
            { word: "explained", level: "intermediate", nuance: "said with clarification" },
            { word: "mentioned", level: "intermediate", nuance: "said briefly" },
            { word: "remarked", level: "advanced", nuance: "said as a comment" }
          ],
          exampleUpgrade: "'She said she was tired' → 'She mentioned she was tired'"
        },
        "very": {
          basic: "very",
          alternatives: [
            { word: "really", level: "beginner", nuance: "informal emphasis" },
            { word: "extremely", level: "intermediate", nuance: "to a high degree" },
            { word: "incredibly", level: "intermediate", nuance: "hard to believe how much" },
            { word: "exceptionally", level: "advanced", nuance: "unusually, remarkably" },
            { word: "remarkably", level: "advanced", nuance: "worthy of attention" }
          ],
          exampleUpgrade: "'Very good' → 'Excellent' / 'Very big' → 'Huge'"
        }
      };

      const wordLower = word.toLowerCase();

      if (synonyms[wordLower]) {
        return {
          ...synonyms[wordLower],
          originalContext: context
        };
      }

      // Generic response for words not in our guide
      return {
        basic: word,
        alternatives: [
          { word: "Try a thesaurus!", level: "tip", nuance: "Look up synonyms online" }
        ],
        exampleUpgrade: "Practice using different words to express similar ideas",
        originalContext: context
      };
    },
  }),
};

// ============================================
// GENERATION PARAMETERS - Auto-configured
// ============================================

type GenerationParams = {
  temperature: number;
  maxTokens: number;
};

function getGenerationParams(correctionMode: boolean, category: string | null): GenerationParams {
  // Mode Correction: precise, shorter responses
  if (correctionMode) {
    return { temperature: 0.3, maxTokens: 400 };
  }

  // Category-specific settings
  switch (category) {
    case "quiz":
      // Quiz: very precise, focused answers
      return { temperature: 0.3, maxTokens: 300 };
    case "roleplay":
      // Role Play: creative, longer scenarios
      return { temperature: 0.9, maxTokens: 500 };
    case "travel":
      // Travel: moderately creative, practical
      return { temperature: 0.7, maxTokens: 400 };
    case "conversation":
    default:
      // Default conversation: balanced
      return { temperature: 0.7, maxTokens: 350 };
  }
}

export async function POST(req: Request) {
  try {
    const { messages, correctionMode = false, sessionId, level = "beginner", category = null } = await req.json();

    console.log("API received messages:", messages);
    console.log("Correction mode:", correctionMode);
    console.log("Level:", level);
    console.log("Category:", category);
    console.log("Session ID:", sessionId);

    // Get auto-configured generation parameters
    const { temperature, maxTokens } = getGenerationParams(correctionMode, category);
    console.log("Generation params:", { temperature, maxTokens });

    // Choose base system prompt based on mode
    let systemPrompt = correctionMode ? CORRECTION_PROMPT : CONVERSATION_PROMPT;

    // Add level-specific instructions
    const levelPrompt = LEVEL_PROMPTS[level as keyof typeof LEVEL_PROMPTS] || LEVEL_PROMPTS.beginner;
    systemPrompt = `${systemPrompt}\n\n${levelPrompt}`;

    // Load user profile and inject context if available
    if (sessionId) {
      try {
        const profile = await getUserProfile(sessionId);
        const profileContext = generateProfileContext(profile);

        if (profileContext) {
          // Append user context to system prompt
          systemPrompt = `${systemPrompt}\n\n${profileContext}`;
          console.log("Injected profile context for session:", sessionId);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
        // Continue without profile context
      }
    }

    const result = streamText({
      model: google("gemini-2.0-flash"),  // Version gratuite
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: teacherTools,
      maxSteps: 3,
      temperature,
      maxTokens,
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
