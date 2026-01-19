"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Languages,
  Bot,
  Mic,
  Volume2,
  VolumeX,
  Plus,
  Send,
  Square,
  Coffee,
  Briefcase,
  Plane,
  BookOpen,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const lastSavedMessageCount = useRef(0);

  // Local state for input
  const [input, setInput] = useState("");

  // Selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      const savedSessionId = localStorage.getItem("english-practice-session");

      if (savedSessionId) {
        try {
          const res = await fetch(`/api/sessions?id=${savedSessionId}`);
          const data = await res.json();

          if (data.success && data.messages?.length > 0) {
            setSessionId(savedSessionId);
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

  // Categories data
  const categories = [
    { id: "conversation", icon: Coffee, label: "Conversation", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { id: "roleplay", icon: Briefcase, label: "Role Play", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { id: "travel", icon: Plane, label: "Travel", color: "text-green-500", bgColor: "bg-green-500/10" },
    { id: "quiz", icon: BookOpen, label: "Quiz", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ];

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4">
            <Languages size={48} className="mx-auto text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Languages size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">English Practice</h1>
              <p className="text-xs text-muted-foreground">Learn by chatting</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Categories */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Categories
          </p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <cat.icon size={18} className={selectedCategory === cat.id ? "text-primary" : cat.color} />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
              voiceEnabled
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            Voice {voiceEnabled ? "ON" : "OFF"}
          </button>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Left Panel - Voice Orb */}
        <div className="w-80 bg-muted/30 border-r border-border flex flex-col items-center justify-center p-8">
          <BigVoiceOrb
            isSpeaking={isSpeaking}
            isListening={isListening}
            onStop={stopSpeaking}
          />

          {/* Status text */}
          <div className="mt-6 text-center">
            {isSpeaking && (
              <p className="text-sm text-primary animate-pulse">Speaking...</p>
            )}
            {isListening && (
              <p className="text-sm text-red-500 animate-pulse">Listening...</p>
            )}
            {!isSpeaking && !isListening && (
              <p className="text-sm text-muted-foreground">Ready to chat</p>
            )}
          </div>

          {/* Mic button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`mt-6 p-4 rounded transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
            title={isListening ? "Stop recording" : "Speak"}
          >
            {isListening ? <Square size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Start a conversation or select a category
                </p>
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
                    className={`max-w-[80%] rounded px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary">Teacher</span>
                        {voiceEnabled && (
                          <button
                            onClick={() => speakText(messageText)}
                            className="text-muted-foreground hover:text-primary transition-colors ml-auto"
                            title="Listen again"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className={`text-sm ${
                      message.role === "user" ? "text-primary-foreground" : "text-card-foreground"
                    }`}>
                      {messageText}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Bot size={14} className="text-primary" />
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-3 py-2 rounded text-sm">
                <p className="font-medium">Error:</p>
                <p>{error.message}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type in English..."}
                className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isListening || isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// Big Voice Orb for the left panel
function BigVoiceOrb({
  isSpeaking,
  isListening,
  onStop,
}: {
  isSpeaking: boolean;
  isListening: boolean;
  onStop: () => void;
}) {
  return (
    <button
      onClick={isSpeaking ? onStop : undefined}
      disabled={!isSpeaking}
      className={`
        relative w-40 h-40 rounded-full
        bg-gradient-to-br from-primary to-secondary
        flex items-center justify-center
        transition-all duration-300
        ${isSpeaking ? "cursor-pointer shadow-[0_0_60px_rgba(var(--orb-glow),0.5)]" : "cursor-default"}
        ${isSpeaking ? "animate-pulse" : ""}
        ${isListening ? "ring-4 ring-red-500 ring-opacity-50" : ""}
      `}
      style={{
        boxShadow: isSpeaking
          ? "0 0 40px rgba(var(--orb-glow), 0.4), 0 0 80px rgba(var(--orb-glow), 0.2)"
          : "0 0 20px rgba(var(--orb-glow), 0.2)",
      }}
    >
      {/* Pulsing rings when speaking */}
      {isSpeaking && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" style={{ animationDelay: "0.3s" }} />
        </>
      )}

      {/* Content */}
      {isSpeaking ? (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="w-2 h-8 bg-white/90 rounded-sm animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${20 + Math.sin(i) * 10}px`,
              }}
            />
          ))}
        </div>
      ) : (
        <Volume2 size={48} className="text-white/80" />
      )}
    </button>
  );
}
