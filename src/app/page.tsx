"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";

export default function Home() {
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const lastSavedMessageCount = useRef(0);

  // Local state for input
  const [input, setInput] = useState("");

  // useChat hook with new API
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Create or load session on mount
  useEffect(() => {
    const initSession = async () => {
      // Check localStorage for existing session
      const savedSessionId = localStorage.getItem("english-practice-session");

      if (savedSessionId) {
        // Try to load existing session
        try {
          const res = await fetch(`/api/sessions?id=${savedSessionId}`);
          const data = await res.json();

          if (data.success && data.messages?.length > 0) {
            setSessionId(savedSessionId);
            // Convert DB messages to UI messages format
            const uiMessages = data.messages.map((msg: { id: number; role: string; content: string; created_at: string }) => ({
              id: `db-${msg.id}`,
              role: msg.role as "user" | "assistant",
              parts: [{ type: "text" as const, text: msg.content }],
            }));
            setMessages(uiMessages as Parameters<typeof setMessages>[0]);
            lastSavedMessageCount.current = data.messages.length;
            setIsLoadingSession(false);
            return;
          }
        } catch (e) {
          console.error("Error loading session:", e);
        }
      }

      // Create new session
      try {
        const res = await fetch("/api/sessions", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setSessionId(data.sessionId);
          localStorage.setItem("english-practice-session", data.sessionId);
        }
      } catch (e) {
        console.error("Error creating session:", e);
      }

      setIsLoadingSession(false);
    };

    initSession();
  }, [setMessages]);

  // Helper to get text content from message parts
  const getMessageText = useCallback((message: (typeof messages)[0]): string => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { type: "text"; text: string }).text)
      .join("");
  }, []);

  // Save new messages to database
  useEffect(() => {
    if (!sessionId || status === "streaming" || status === "submitted") return;

    const saveNewMessages = async () => {
      const newMessages = messages.slice(lastSavedMessageCount.current);

      for (const msg of newMessages) {
        const content = getMessageText(msg);
        if (content) {
          try {
            await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                role: msg.role,
                content,
              }),
            });
          } catch (e) {
            console.error("Error saving message:", e);
          }
        }
      }

      lastSavedMessageCount.current = messages.length;
    };

    if (messages.length > lastSavedMessageCount.current) {
      saveNewMessages();
    }
  }, [messages, sessionId, status, getMessageText]);

  // Log error if any
  useEffect(() => {
    if (error) {
      console.error("useChat error:", error);
    }
  }, [error]);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak the last assistant message
  useEffect(() => {
    if (!voiceEnabled) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && status === "ready") {
      const text = getMessageText(lastMessage);
      if (text) {
        speakText(text);
      }
    }
  }, [messages, status, voiceEnabled, getMessageText]);

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text function
  const startListening = () => {
    if (
      typeof window === "undefined" ||
      (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window))
    ) {
      alert("Speech recognition is not supported in this browser. Try Chrome!");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Start new conversation
  const startNewChat = async () => {
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        localStorage.setItem("english-practice-session", data.sessionId);
        setMessages([]);
        lastSavedMessageCount.current = 0;
      }
    } catch (e) {
      console.error("Error creating new session:", e);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🇬🇧</div>
          <p className="text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇬🇧</span>
            <div>
              <h1 className="text-xl font-bold text-blue-900">English Practice</h1>
              <p className="text-sm text-blue-600">Learn by chatting!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="New chat"
            >
              ➕
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${
                voiceEnabled
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-400"
              }`}
              title={voiceEnabled ? "Voice ON" : "Voice OFF"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                Hello! I&apos;m your English teacher!
              </h2>
              <p className="text-gray-600 mb-6">
                Let&apos;s practice English together. Don&apos;t worry about mistakes!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <SuggestionButton onClick={() => setInput("Hello! My name is...")}>
                  👋 Say hello
                </SuggestionButton>
                <SuggestionButton onClick={() => setInput("Can we play restaurant?")}>
                  🍽️ Role play
                </SuggestionButton>
                <SuggestionButton onClick={() => setInput("Give me a quiz about animals!")}>
                  🎯 Quiz
                </SuggestionButton>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => {
            const messageText = getMessageText(message);
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white shadow-md border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🤖</span>
                      <span className="text-xs font-medium text-blue-600">
                        Teacher
                      </span>
                      {voiceEnabled && (
                        <button
                          onClick={() => speakText(messageText)}
                          className="text-xs text-gray-400 hover:text-blue-500"
                          title="Listen again"
                        >
                          🔊
                        </button>
                      )}
                    </div>
                  )}
                  <p
                    className={`${
                      message.role === "user" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {messageText}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <span className="animate-pulse">🔊</span>
              <span className="text-sm">Speaking...</span>
              <button
                onClick={stopSpeaking}
                className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30"
              >
                Stop
              </button>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            {/* Microphone button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isListening ? "Stop recording" : "Speak"}
            >
              {isListening ? "⏹️" : "🎤"}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type in English..."}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
              disabled={isListening || isLoading}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>

          {/* Listening indicator */}
          {isListening && (
            <div className="mt-2 text-center text-sm text-red-500 animate-pulse">
              🎤 Speak now in English...
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

// Suggestion button component
function SuggestionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-50 transition-colors"
    >
      {children}
    </button>
  );
}
