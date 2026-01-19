"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Languages,
  Bot,
  Mic,
  MicOff,
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
  Menu,
  X,
  MessageCircle,
  PenLine,
  GraduationCap,
  MessageSquare,
  Pause,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CorrectionHighlight } from "@/components/CorrectionHighlight";

export default function Home() {
  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const lastSavedMessageCount = useRef(0);

  // Local state for input
  const [input, setInput] = useState("");

  // Selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Correction mode toggle
  const [correctionMode, setCorrectionMode] = useState(false);

  // Language level state
  type Level = "beginner" | "intermediate" | "advanced";
  const [level, setLevel] = useState<Level>("beginner");

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

  // Save new messages to database and update profile
  useEffect(() => {
    if (!sessionId || status === "streaming" || status === "submitted") return;

    const saveNewMessages = async () => {
      const newMessages = messages.slice(lastSavedMessageCount.current);
      let messagesSaved = 0;

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
            messagesSaved++;
          } catch (e) {
            console.error("Error saving message:", e);
          }
        }
      }

      // Update user profile with message count
      if (messagesSaved > 0) {
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              incrementMessages: messagesSaved,
            }),
          });
        } catch (e) {
          console.error("Error updating profile:", e);
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
  const [speechRate, setSpeechRate] = useState(0.9); // 0.5 to 1.5
  const [continuousMode, setContinuousMode] = useState(false);
  const continuousModeRef = useRef(false); // Ref for callbacks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load speech rate from localStorage on mount
  useEffect(() => {
    const savedRate = localStorage.getItem("english-practice-speech-rate");
    if (savedRate) {
      setSpeechRate(parseFloat(savedRate));
    }
  }, []);

  // Sync continuousMode ref with state (for use in callbacks)
  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  // Save speech rate to localStorage when it changes
  const updateSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem("english-practice-speech-rate", rate.toString());
  };

  // Load level from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem("english-practice-level");
    if (savedLevel && ["beginner", "intermediate", "advanced"].includes(savedLevel)) {
      setLevel(savedLevel as Level);
    }
  }, []);

  // Update level in localStorage and profile DB
  const updateLevel = async (newLevel: Level) => {
    setLevel(newLevel);
    localStorage.setItem("english-practice-level", newLevel);

    // Update profile in DB
    if (sessionId) {
      try {
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            level: newLevel,
          }),
        });
      } catch (e) {
        console.error("Error updating level in profile:", e);
      }
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak the last assistant message (using clean text without suggestions)
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
    utterance.rate = speechRate;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // In continuous mode, restart listening after TTS finishes
      if (continuousModeRef.current) {
        // Small delay to avoid overlap
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };
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

      // In continuous mode, send message automatically
      if (continuousModeRef.current && transcript.trim()) {
        sendMessage(
          { text: transcript },
          { body: { correctionMode, sessionId, level, category: selectedCategory } }
        );
      } else {
        // Normal mode: put in input field
        setInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      // In continuous mode, don't stop on errors like "no-speech"
      // The loop will restart via TTS onend
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

  // Toggle continuous conversation mode
  const toggleContinuousMode = () => {
    if (continuousMode) {
      // Stopping: cancel everything
      setContinuousMode(false);
      stopListening();
      stopSpeaking();
    } else {
      // Starting: enable voice and start listening
      setContinuousMode(true);
      setVoiceEnabled(true); // Ensure voice is on
      // Start listening after a brief delay
      setTimeout(() => startListening(), 100);
    }
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
        setSidebarOpen(false);
      }
    } catch (e) {
      console.error("Error creating new session:", e);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input }, { body: { correctionMode, sessionId, level, category: selectedCategory } });
      setInput("");
    }
  };

  // Handle category selection and track interest
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setSidebarOpen(false);

    // Track interest in profile
    if (sessionId && categoryId !== selectedCategory) {
      try {
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            interests: [categoryId],
          }),
        });
      } catch (e) {
        console.error("Error tracking interest:", e);
      }
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: drawer */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo + Close button on mobile */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Languages size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">English Practice</h1>
              <p className="text-xs text-muted-foreground">Learn by chatting</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded hover:bg-muted text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            <Plus size={18} />
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
              onClick={() => handleCategorySelect(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors min-h-[44px] ${
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
          {/* Mode Toggle */}
          <button
            onClick={() => setCorrectionMode(!correctionMode)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors min-h-[44px] ${
              correctionMode
                ? "bg-orange-500/10 text-orange-500"
                : "bg-primary/10 text-primary"
            }`}
          >
            {correctionMode ? <PenLine size={18} /> : <MessageCircle size={18} />}
            {correctionMode ? "Correction Mode" : "Conversation Mode"}
          </button>

          {/* Level Selector */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={16} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">English Level</p>
            </div>
            <div className="flex gap-1">
              {[
                { id: "beginner" as Level, label: "Beginner", color: "text-green-500" },
                { id: "intermediate" as Level, label: "Inter.", color: "text-yellow-500" },
                { id: "advanced" as Level, label: "Advanced", color: "text-red-500" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateLevel(option.id)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                    level === option.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors min-h-[44px] ${
              voiceEnabled
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            Voice {voiceEnabled ? "ON" : "OFF"}
          </button>

          {/* Continuous Mode Toggle - only show when voice is enabled */}
          {voiceEnabled && (
            <button
              onClick={toggleContinuousMode}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors min-h-[44px] ${
                continuousMode
                  ? "bg-green-500/10 text-green-500 animate-pulse"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {continuousMode ? <Pause size={18} /> : <MessageSquare size={18} />}
              {continuousMode ? "Stop Conversation" : "Hands-Free Mode"}
            </button>
          )}

          {/* Speech Speed Control - only show when voice is enabled */}
          {voiceEnabled && (
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground mb-2">Speech Speed</p>
              <div className="flex gap-1">
                {[
                  { label: "Slow", rate: 0.7 },
                  { label: "Normal", rate: 0.9 },
                  { label: "Fast", rate: 1.2 },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => updateSpeechRate(option.rate)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                      speechRate === option.rate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Left Panel - Voice Orb (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex w-80 bg-muted/30 border-r border-border flex-col items-center justify-center p-8">
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
            {isLoading && !isSpeaking && !isListening && (
              <p className="text-sm text-yellow-500 animate-pulse">Processing...</p>
            )}
            {!isSpeaking && !isListening && !isLoading && (
              <p className="text-sm text-muted-foreground">Ready to chat</p>
            )}
          </div>

          {/* Continuous Mode indicator */}
          {continuousMode && (
            <div className="mt-2 px-3 py-1.5 rounded text-xs font-medium bg-green-500/20 text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Hands-Free Active
            </div>
          )}

          {/* Mode indicator on desktop */}
          <div className={`mt-4 px-3 py-1.5 rounded text-sm font-medium ${
            correctionMode
              ? "bg-orange-500/20 text-orange-500"
              : "bg-primary/20 text-primary"
          }`}>
            {correctionMode ? "Correction Mode" : "Conversation Mode"}
          </div>

          {/* Level indicator on desktop */}
          <div className={`mt-2 px-3 py-1.5 rounded text-xs font-medium ${
            level === "beginner"
              ? "bg-green-500/20 text-green-500"
              : level === "intermediate"
              ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
              : "bg-red-500/20 text-red-500"
          }`}>
            {level.charAt(0).toUpperCase() + level.slice(1)} Level
          </div>

          {/* Mic button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`mt-6 p-4 rounded transition-all min-h-[56px] min-w-[56px] ${
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
        <div className="flex-1 flex flex-col min-w-0 h-screen lg:h-auto">
          {/* Mobile Header - FIXED */}
          <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-2 border-b border-border bg-card">
            {/* Left: Menu + New Chat */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded hover:bg-muted text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={startNewChat}
                className="p-2 rounded hover:bg-muted text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="New chat"
              >
                <Plus size={22} />
              </button>
            </div>

            {/* Center: Mini Voice Orb + Mode + Level indicators */}
            <div className="flex items-center gap-1.5">
              {/* Continuous mode toggle on orb */}
              <button
                onClick={voiceEnabled ? toggleContinuousMode : undefined}
                disabled={!voiceEnabled}
                className="relative"
              >
                <MiniVoiceOrb
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  onStop={stopSpeaking}
                />
                {/* Continuous mode indicator dot */}
                {continuousMode && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse" />
                )}
              </button>
              {/* Mode toggle - tap to switch */}
              <button
                onClick={() => setCorrectionMode(!correctionMode)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  correctionMode
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-primary/20 text-primary"
                }`}
                aria-label={correctionMode ? "Switch to conversation mode" : "Switch to correction mode"}
              >
                {correctionMode ? "Correction" : "Chat"}
              </button>
              {/* Level indicator */}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                level === "beginner"
                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                  : level === "intermediate"
                  ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                  : "bg-red-500/20 text-red-500"
              }`}>
                {level === "beginner" ? "B" : level === "intermediate" ? "I" : "A"}
              </span>
            </div>

            {/* Right: Voice + Theme */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  voiceEnabled ? "text-primary" : "text-muted-foreground"
                }`}
                aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <ThemeToggle />
            </div>
          </header>

          {/* Chat Messages - with padding for fixed header/footer on mobile */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-16 pb-24 lg:pt-4 lg:pb-4">
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="lg:hidden mb-4">
                  <div className="inline-flex p-3 bg-primary/10 rounded-full">
                    <Languages size={32} className="text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Start a conversation or select a category
                </p>
                {/* Quick category buttons on mobile */}
                <div className="lg:hidden flex flex-wrap justify-center gap-2 mt-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${cat.bgColor} ${cat.color}`}
                    >
                      <cat.icon size={16} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => {
              const cleanText = message.role === "assistant"
                ? getMessageText(message)
                : getMessageText(message);
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded px-3 py-2 ${
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
                            onClick={() => speakText(cleanText)}
                            className="text-muted-foreground hover:text-primary transition-colors ml-auto p-1"
                            title="Listen again"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    {/* Render with correction highlighting in Correction Mode, plain text otherwise */}
                    {message.role === "assistant" && correctionMode ? (
                      <div className="text-card-foreground">
                        <CorrectionHighlight text={cleanText} />
                      </div>
                    ) : (
                      <p className={`text-sm whitespace-pre-wrap ${
                        message.role === "user" ? "text-primary-foreground" : "text-card-foreground"
                      }`}>
                        {cleanText}
                      </p>
                    )}
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

          {/* Input Area - FIXED on mobile */}
          <div className="fixed lg:static bottom-0 left-0 right-0 z-30 border-t border-border p-3 sm:p-4 bg-card">
            <form onSubmit={handleSubmit} className="flex gap-2">
              {/* Mic button - visible on mobile */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`lg:hidden p-3 rounded transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isListening ? <Square size={20} /> : <Mic size={20} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type in English..."}
                className="flex-1 px-3 py-3 border border-border rounded bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[44px]"
                disabled={isListening || isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            {/* Listening indicator */}
            {isListening && (
              <div className="mt-2 text-center text-sm text-red-500 animate-pulse flex items-center justify-center gap-2">
                <Mic size={14} />
                Speak now in English...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Big Voice Orb for desktop left panel
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
        ${isSpeaking ? "cursor-pointer" : "cursor-default"}
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

// Mini Voice Orb for mobile header
function MiniVoiceOrb({
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
        relative w-10 h-10 rounded-full
        bg-gradient-to-br from-primary to-secondary
        flex items-center justify-center
        transition-all duration-300
        ${isSpeaking ? "cursor-pointer" : "cursor-default"}
        ${isListening ? "ring-2 ring-red-500" : ""}
      `}
      style={{
        boxShadow: isSpeaking
          ? "0 0 20px rgba(var(--orb-glow), 0.4)"
          : "0 0 10px rgba(var(--orb-glow), 0.2)",
      }}
    >
      {isSpeaking && (
        <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-30" />
      )}

      {isSpeaking ? (
        <div className="flex items-center gap-0.5">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="w-1 bg-white/90 rounded-sm animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${8 + Math.sin(i) * 4}px`,
              }}
            />
          ))}
        </div>
      ) : (
        <Volume2 size={18} className="text-white/80" />
      )}
    </button>
  );
}
