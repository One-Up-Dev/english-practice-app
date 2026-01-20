/**
 * Scenarios for Guided English Practice Lessons
 * Each scenario has multiple steps that guide the learner through a real-life situation
 */

// ============================================
// Types
// ============================================

export interface ScenarioStep {
  id: number;
  instruction: string;      // What the user should do
  aiPrompt: string;         // Context for the AI at this step
  successCriteria?: string; // Optional: how to validate success
}

export interface Scenario {
  id: string;
  category: "travel" | "roleplay" | "conversation" | "quiz";
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: ScenarioStep[];
  vocabularyFocus?: string[];
}

// ============================================
// Travel Scenarios (3)
// ============================================

const travelScenarios: Scenario[] = [
  {
    id: "travel-airport",
    category: "travel",
    title: "At the Airport",
    description: "Practice checking in, going through security, and boarding your flight.",
    difficulty: "beginner",
    estimatedMinutes: 10,
    vocabularyFocus: ["boarding pass", "gate", "luggage", "security", "delayed"],
    steps: [
      {
        id: 1,
        instruction: "Greet the check-in agent and say you have a flight to London.",
        aiPrompt: "You are a friendly airline check-in agent. Greet the passenger warmly and ask for their passport and booking reference.",
        successCriteria: "Student mentions destination and asks to check in"
      },
      {
        id: 2,
        instruction: "The agent asks about luggage. Tell them you have one suitcase to check and one carry-on.",
        aiPrompt: "Ask about luggage - how many bags to check and any carry-on items. Mention the weight limit is 23 kilograms.",
        successCriteria: "Student describes their luggage"
      },
      {
        id: 3,
        instruction: "Ask the agent which gate your flight departs from.",
        aiPrompt: "Hand over the boarding pass and tell them the flight leaves from Gate 42. Boarding starts at 2:30 PM. Wish them a good flight.",
        successCriteria: "Student asks about gate"
      },
      {
        id: 4,
        instruction: "At security, the officer asks you to remove items. Respond appropriately.",
        aiPrompt: "You are a security officer. Ask the passenger to remove their laptop from their bag, take out any liquids, and remove their belt and jacket.",
        successCriteria: "Student acknowledges and responds to security instructions"
      },
      {
        id: 5,
        instruction: "You hear an announcement that your flight is delayed. Ask an airport staff member for more information.",
        aiPrompt: "Announce that the flight to London is delayed by 45 minutes. Apologize for the inconvenience and offer a voucher for free coffee at the airport cafe.",
        successCriteria: "Student asks about delay and responds to offer"
      }
    ]
  },
  {
    id: "travel-hotel",
    category: "travel",
    title: "Checking into a Hotel",
    description: "Learn to check in, ask about amenities, and handle room issues.",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vocabularyFocus: ["reservation", "room key", "checkout", "amenities", "reception"],
    steps: [
      {
        id: 1,
        instruction: "Approach the reception desk and say you have a reservation.",
        aiPrompt: "You are a hotel receptionist. Greet the guest warmly and ask for their name and confirmation number.",
        successCriteria: "Student mentions having a reservation"
      },
      {
        id: 2,
        instruction: "Confirm your booking details when asked.",
        aiPrompt: "Ask the guest to confirm: 3 nights, double room, breakfast included. Ask if this is correct.",
        successCriteria: "Student confirms or corrects the booking details"
      },
      {
        id: 3,
        instruction: "Ask what time breakfast is served and where the restaurant is.",
        aiPrompt: "Provide the room key for room 305 on the third floor. Wait for the guest to ask questions about the hotel.",
        successCriteria: "Student asks about breakfast or hotel facilities"
      },
      {
        id: 4,
        instruction: "Call reception and report that the air conditioning is not working in your room.",
        aiPrompt: "Answer the phone as the reception. Listen to the complaint and apologize. Offer to send maintenance right away or offer a room change.",
        successCriteria: "Student reports the problem clearly"
      }
    ]
  },
  {
    id: "travel-restaurant",
    category: "travel",
    title: "Ordering at a Restaurant",
    description: "Practice ordering food, asking about the menu, and paying the bill.",
    difficulty: "beginner",
    estimatedMinutes: 10,
    vocabularyFocus: ["menu", "waiter", "bill", "tip", "reservation", "vegetarian"],
    steps: [
      {
        id: 1,
        instruction: "Tell the host you have a reservation for two people.",
        aiPrompt: "You are a restaurant host. Greet the guests and ask for the name on the reservation.",
        successCriteria: "Student mentions reservation and number of people"
      },
      {
        id: 2,
        instruction: "Ask the waiter what the special of the day is.",
        aiPrompt: "You are the waiter. Present menus and wait for questions. The special today is grilled salmon with vegetables.",
        successCriteria: "Student asks about specials or menu items"
      },
      {
        id: 3,
        instruction: "Order your food. Get a starter, main course, and drink.",
        aiPrompt: "Take the order. Repeat it back to confirm. Ask how they would like their steak cooked if they order one.",
        successCriteria: "Student orders at least two items"
      },
      {
        id: 4,
        instruction: "Tell the waiter you have a food allergy and ask if the dish contains nuts.",
        aiPrompt: "Respond to the allergy concern seriously. Confirm the dish does not contain nuts but is prepared in a kitchen that handles nuts. Offer alternatives.",
        successCriteria: "Student asks about allergies or ingredients"
      },
      {
        id: 5,
        instruction: "Ask for the bill and ask if service is included.",
        aiPrompt: "Bring the bill. It is 45 pounds total. Service is not included. Accept payment by card or cash.",
        successCriteria: "Student asks for bill and about service/tipping"
      }
    ]
  }
];

// ============================================
// Role Play Scenarios (3)
// ============================================

const roleplayScenarios: Scenario[] = [
  {
    id: "roleplay-job-interview",
    category: "roleplay",
    title: "Job Interview",
    description: "Practice introducing yourself, answering questions, and asking about the role.",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    vocabularyFocus: ["experience", "qualifications", "strengths", "salary", "responsibilities"],
    steps: [
      {
        id: 1,
        instruction: "Greet the interviewer and introduce yourself briefly.",
        aiPrompt: "You are an interviewer for a marketing position. Greet the candidate, shake hands, and ask them to have a seat. Start with: Tell me a little about yourself.",
        successCriteria: "Student introduces themselves professionally"
      },
      {
        id: 2,
        instruction: "The interviewer asks about your experience. Describe your previous work.",
        aiPrompt: "Ask: What relevant experience do you have for this marketing role? Listen and ask a follow-up question about a specific project.",
        successCriteria: "Student describes work experience"
      },
      {
        id: 3,
        instruction: "Answer when asked about your biggest strength and one area you want to improve.",
        aiPrompt: "Ask: What would you say is your biggest strength? And what is one area you are working to improve?",
        successCriteria: "Student provides strength and area for improvement"
      },
      {
        id: 4,
        instruction: "Ask the interviewer about the team you would be working with.",
        aiPrompt: "Wait for the candidate to ask questions. The team has 5 people, works hybrid with 3 days in office, and the role reports to the Marketing Director.",
        successCriteria: "Student asks relevant questions about the role"
      },
      {
        id: 5,
        instruction: "Thank the interviewer and ask about the next steps in the process.",
        aiPrompt: "Explain that you will contact candidates within a week. Thank them for their time and escort them out.",
        successCriteria: "Student thanks interviewer and asks about timeline"
      }
    ]
  },
  {
    id: "roleplay-doctor",
    category: "roleplay",
    title: "Doctor's Appointment",
    description: "Learn to describe symptoms, understand diagnosis, and ask about treatment.",
    difficulty: "intermediate",
    estimatedMinutes: 10,
    vocabularyFocus: ["symptoms", "prescription", "appointment", "diagnosis", "pharmacy"],
    steps: [
      {
        id: 1,
        instruction: "Tell the doctor why you made this appointment.",
        aiPrompt: "You are a friendly doctor. Greet the patient and ask: What brings you in today? What symptoms are you experiencing?",
        successCriteria: "Student describes their reason for visit"
      },
      {
        id: 2,
        instruction: "Describe your symptoms in detail - when they started and how severe they are.",
        aiPrompt: "Ask follow-up questions: How long have you had these symptoms? Are they constant or do they come and go? Rate the pain from 1 to 10.",
        successCriteria: "Student provides details about symptoms"
      },
      {
        id: 3,
        instruction: "Answer questions about your medical history.",
        aiPrompt: "Ask: Do you have any allergies to medications? Are you currently taking any other medicines? Have you had this problem before?",
        successCriteria: "Student responds to medical history questions"
      },
      {
        id: 4,
        instruction: "The doctor gives a diagnosis. Ask questions about it.",
        aiPrompt: "Diagnose a mild throat infection. Explain it is not serious but needs antibiotics. Prescribe medication for 7 days. Wait for patient questions.",
        successCriteria: "Student asks about diagnosis or treatment"
      },
      {
        id: 5,
        instruction: "Ask about how to take the medicine and any side effects.",
        aiPrompt: "Explain: Take one pill twice a day with food. Side effects may include mild stomach upset. Rest and drink plenty of fluids. Come back if symptoms worsen.",
        successCriteria: "Student asks about medication instructions"
      }
    ]
  },
  {
    id: "roleplay-customer-service",
    category: "roleplay",
    title: "Phone Call to Customer Service",
    description: "Practice explaining a problem and negotiating a solution on the phone.",
    difficulty: "intermediate",
    estimatedMinutes: 10,
    vocabularyFocus: ["complaint", "refund", "manager", "reference number", "policy"],
    steps: [
      {
        id: 1,
        instruction: "Explain that you received a damaged product and want to report it.",
        aiPrompt: "You are a customer service agent. Answer: Thank you for calling. How may I help you today? Ask for the order number.",
        successCriteria: "Student explains the problem"
      },
      {
        id: 2,
        instruction: "Provide your order details when asked.",
        aiPrompt: "Ask for the order number and the customer's email address to look up the order. Confirm you found it.",
        successCriteria: "Student provides order information"
      },
      {
        id: 3,
        instruction: "Describe what is wrong with the product.",
        aiPrompt: "Ask: Can you describe the damage? When did you receive the item? Did you notice the damage when you opened it?",
        successCriteria: "Student describes the damage"
      },
      {
        id: 4,
        instruction: "The agent offers a replacement. Ask if you can get a refund instead.",
        aiPrompt: "Apologize for the inconvenience. Offer to send a replacement product within 3 to 5 business days. Wait for the customer's response.",
        successCriteria: "Student requests alternative solution"
      },
      {
        id: 5,
        instruction: "Accept the solution and ask for a confirmation email.",
        aiPrompt: "Agree to process the refund. It will take 5 to 7 business days to appear. Ask if you can help with anything else and provide a reference number.",
        successCriteria: "Student confirms and asks for confirmation"
      }
    ]
  }
];

// ============================================
// Conversation Scenarios (3)
// ============================================

const conversationScenarios: Scenario[] = [
  {
    id: "conversation-meeting-someone",
    category: "conversation",
    title: "Meeting Someone New",
    description: "Practice small talk, talking about yourself, and asking questions.",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vocabularyFocus: ["hobbies", "occupation", "hometown", "interests", "nice to meet you"],
    steps: [
      {
        id: 1,
        instruction: "Introduce yourself to someone you just met at a party.",
        aiPrompt: "You are a friendly person at a party. Introduce yourself as Alex and say it is nice to meet them. Ask where they are from.",
        successCriteria: "Student introduces themselves"
      },
      {
        id: 2,
        instruction: "Tell them where you are from and ask what they do for work.",
        aiPrompt: "Show interest in their hometown. Share that you work in software development. Ask what they do for a living.",
        successCriteria: "Student shares origin and asks about work"
      },
      {
        id: 3,
        instruction: "Share what you do for work and ask about their hobbies.",
        aiPrompt: "React positively to their job. Mention your hobbies include hiking and photography. Ask what they like to do in their free time.",
        successCriteria: "Student talks about work and asks about hobbies"
      },
      {
        id: 4,
        instruction: "Talk about a hobby you enjoy and find something in common.",
        aiPrompt: "If they mention a similar interest, show enthusiasm. If different, ask questions to learn more. Look for common ground.",
        successCriteria: "Student discusses hobbies and engages"
      },
      {
        id: 5,
        instruction: "Say you enjoyed talking and suggest keeping in touch.",
        aiPrompt: "Agree it was a great conversation. Suggest exchanging contact information. Say you hope to see them again soon.",
        successCriteria: "Student wraps up conversation politely"
      }
    ]
  },
  {
    id: "conversation-weekend",
    category: "conversation",
    title: "Talking About Your Weekend",
    description: "Practice using past tense to describe recent activities.",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vocabularyFocus: ["went", "saw", "enjoyed", "relaxed", "spent time"],
    steps: [
      {
        id: 1,
        instruction: "A colleague asks how your weekend was. Tell them about one thing you did.",
        aiPrompt: "You are a friendly colleague on Monday morning. Ask: How was your weekend? Did you do anything fun?",
        successCriteria: "Student uses past tense to describe weekend"
      },
      {
        id: 2,
        instruction: "Give more details about the activity you mentioned.",
        aiPrompt: "Show interest and ask follow-up questions: Who did you go with? How was it? Would you recommend it?",
        successCriteria: "Student provides more details in past tense"
      },
      {
        id: 3,
        instruction: "Ask your colleague about their weekend.",
        aiPrompt: "Wait for them to ask about your weekend. Share that you went to a new restaurant on Saturday and relaxed at home on Sunday.",
        successCriteria: "Student asks about colleague's weekend"
      },
      {
        id: 4,
        instruction: "React to what they did and ask a follow-up question.",
        aiPrompt: "Answer their follow-up questions about the restaurant. It was Italian food and very good but a bit expensive.",
        successCriteria: "Student reacts and asks questions"
      }
    ]
  },
  {
    id: "conversation-making-plans",
    category: "conversation",
    title: "Making Plans with a Friend",
    description: "Practice using future tense and making suggestions.",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vocabularyFocus: ["would you like to", "how about", "shall we", "sounds good", "available"],
    steps: [
      {
        id: 1,
        instruction: "Ask your friend if they are free this weekend.",
        aiPrompt: "You are a friend. Say you are free on Saturday but busy on Sunday. Ask what they have in mind.",
        successCriteria: "Student asks about availability"
      },
      {
        id: 2,
        instruction: "Suggest an activity you could do together.",
        aiPrompt: "React to their suggestion. If it sounds fun, agree enthusiastically. If not, suggest an alternative like going to the cinema or trying a new cafe.",
        successCriteria: "Student makes a suggestion"
      },
      {
        id: 3,
        instruction: "Discuss and agree on the time and place to meet.",
        aiPrompt: "Suggest meeting at 2 PM at the main entrance. Ask if that works for them or if another time is better.",
        successCriteria: "Student negotiates time and place"
      },
      {
        id: 4,
        instruction: "Confirm the plans and say you are looking forward to it.",
        aiPrompt: "Confirm the plan. Say you are excited and will see them on Saturday. Suggest texting on Friday to confirm.",
        successCriteria: "Student confirms and expresses enthusiasm"
      }
    ]
  }
];

// ============================================
// Quiz Scenarios (3)
// ============================================

const quizScenarios: Scenario[] = [
  {
    id: "quiz-irregular-verbs",
    category: "quiz",
    title: "Irregular Verbs Challenge",
    description: "Test your knowledge of common irregular verbs in past tense.",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vocabularyFocus: ["went", "saw", "took", "made", "gave", "bought", "thought", "brought"],
    steps: [
      {
        id: 1,
        instruction: "Answer: What is the past tense of GO?",
        aiPrompt: "Start the quiz. Ask: What is the past tense of GO? Wait for answer. Correct answer is WENT.",
        successCriteria: "Student answers with 'went'"
      },
      {
        id: 2,
        instruction: "Answer: What is the past tense of SEE?",
        aiPrompt: "Give feedback on previous answer. Ask: What is the past tense of SEE? Correct answer is SAW.",
        successCriteria: "Student answers with 'saw'"
      },
      {
        id: 3,
        instruction: "Answer: What is the past tense of TAKE?",
        aiPrompt: "Give feedback. Ask: What is the past tense of TAKE? Correct answer is TOOK.",
        successCriteria: "Student answers with 'took'"
      },
      {
        id: 4,
        instruction: "Make a sentence using the past tense of BUY.",
        aiPrompt: "Change format. Say: Now make a sentence using the past tense of BUY (bought). Give an example if they struggle.",
        successCriteria: "Student uses 'bought' in a sentence"
      },
      {
        id: 5,
        instruction: "Make a sentence using the past tense of THINK.",
        aiPrompt: "Give feedback. Ask for a sentence using the past tense of THINK (thought). Congratulate them on completing the quiz.",
        successCriteria: "Student uses 'thought' in a sentence"
      }
    ]
  },
  {
    id: "quiz-prepositions",
    category: "quiz",
    title: "Prepositions Master",
    description: "Practice using IN, ON, and AT correctly with time and place.",
    difficulty: "intermediate",
    estimatedMinutes: 8,
    vocabularyFocus: ["in", "on", "at", "time expressions", "place expressions"],
    steps: [
      {
        id: 1,
        instruction: "Fill the blank: I wake up ___ 7 AM every day.",
        aiPrompt: "Start the preposition quiz. Ask them to fill in: I wake up ___ 7 AM every day. Correct answer is AT (specific time).",
        successCriteria: "Student answers 'at'"
      },
      {
        id: 2,
        instruction: "Fill the blank: My birthday is ___ March.",
        aiPrompt: "Give feedback. New question: My birthday is ___ March. Correct answer is IN (month).",
        successCriteria: "Student answers 'in'"
      },
      {
        id: 3,
        instruction: "Fill the blank: The meeting is ___ Monday.",
        aiPrompt: "Give feedback. New question: The meeting is ___ Monday. Correct answer is ON (day of week).",
        successCriteria: "Student answers 'on'"
      },
      {
        id: 4,
        instruction: "Fill the blank: I live ___ Paris. I work ___ an office ___ the city center.",
        aiPrompt: "Multiple blanks: I live ___ Paris. I work ___ an office ___ the city center. Answers: IN Paris, IN an office, IN the city center.",
        successCriteria: "Student answers 'in' for all three"
      },
      {
        id: 5,
        instruction: "Create your own sentence using AT, IN, and ON correctly.",
        aiPrompt: "Final challenge: Create a sentence (or sentences) that uses AT, IN, and ON correctly. Give feedback on their creation.",
        successCriteria: "Student creates correct sentences"
      }
    ]
  },
  {
    id: "quiz-vocabulary",
    category: "quiz",
    title: "Vocabulary Expansion",
    description: "Learn synonyms and antonyms to expand your vocabulary.",
    difficulty: "intermediate",
    estimatedMinutes: 10,
    vocabularyFocus: ["synonyms", "antonyms", "adjectives", "descriptive words"],
    steps: [
      {
        id: 1,
        instruction: "Give a synonym for HAPPY (a word with similar meaning).",
        aiPrompt: "Start vocabulary quiz. Ask for a synonym of HAPPY. Accept: glad, joyful, pleased, cheerful, delighted.",
        successCriteria: "Student provides a valid synonym"
      },
      {
        id: 2,
        instruction: "Give an antonym for BIG (a word with opposite meaning).",
        aiPrompt: "Good job! Now the opposite: Give an antonym for BIG. Accept: small, tiny, little, miniature.",
        successCriteria: "Student provides a valid antonym"
      },
      {
        id: 3,
        instruction: "Replace VERY GOOD with a single, stronger word.",
        aiPrompt: "Level up! Replace VERY GOOD with one word. Accept: excellent, fantastic, wonderful, amazing, superb, outstanding.",
        successCriteria: "Student provides a strong adjective"
      },
      {
        id: 4,
        instruction: "Replace VERY BAD with a single, stronger word.",
        aiPrompt: "Great! Now replace VERY BAD with one word. Accept: terrible, awful, horrible, dreadful, appalling.",
        successCriteria: "Student provides a strong negative adjective"
      },
      {
        id: 5,
        instruction: "Use three different words to describe a positive experience you had recently.",
        aiPrompt: "Final challenge: Describe a positive experience using at least three different descriptive words. Encourage variety and give feedback.",
        successCriteria: "Student uses varied vocabulary"
      }
    ]
  }
];

// ============================================
// Export all scenarios
// ============================================

export const scenarios: Scenario[] = [
  ...travelScenarios,
  ...roleplayScenarios,
  ...conversationScenarios,
  ...quizScenarios
];

// Helper to get scenarios by category
export function getScenariosByCategory(category: Scenario["category"]): Scenario[] {
  return scenarios.filter(s => s.category === category);
}

// Helper to get a specific scenario
export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}

// Category metadata for UI
export const scenarioCategories = [
  {
    id: "travel" as const,
    label: "Travel",
    description: "Practice real travel situations",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    id: "roleplay" as const,
    label: "Role Play",
    description: "Professional and daily life scenarios",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "conversation" as const,
    label: "Conversation",
    description: "Everyday social interactions",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  {
    id: "quiz" as const,
    label: "Quiz",
    description: "Test your grammar and vocabulary",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  }
];
