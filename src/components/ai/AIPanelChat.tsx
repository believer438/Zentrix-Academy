import { useRef, useEffect, useState, useCallback } from "react";
import {
  X, Send, Sparkles, BookOpen, HelpCircle, Lightbulb,
  Bot, Plus, Languages, Map, Calculator, FileSearch, Brain,
} from "lucide-react";
import { type AIMessage } from "@/lib/backend-types";
import {
  apiAIChatStream,
  apiSummarizeCours,
  apiGenerateQuestions,
  isAuthenticated,
} from "@/lib/api-client";

export type AIMode = "assistant" | "document" | "course";

interface AIPanelChatProps {
  isOpen:           boolean;
  onClose:          () => void;
  contextCourse?:   string;
  contextCoursId?:  number;
  contextCourseId?: number;   // catalogue course id
  contextChapterId?: number;  // current chapter id
  mode?:            AIMode;
}

const MODE_CONFIG: Record<AIMode, { title: string; icon: typeof Bot; color: string; placeholder: string }> = {
  assistant: {
    title:       "Assistant Zentrix IA",
    icon:        Bot,
    color:       "from-[#FFB347] to-[#FF6B00]",
    placeholder: "Posez n'importe quelle question…",
  },
  document: {
    title:       "Analyse de document",
    icon:        FileSearch,
    color:       "from-blue-400 to-indigo-600",
    placeholder: "Posez une question sur le document…",
  },
  course: {
    title:       "Tuteur du cours",
    icon:        Brain,
    color:       "from-emerald-400 to-teal-600",
    placeholder: "Posez une question sur ce cours…",
  },
};

const quickActionsByMode: Record<
  AIMode,
  { icon: typeof Bot; label: string; prompt: string; action?: string }[]
> = {
  assistant: [
    { icon: Lightbulb, label: "Expliquer",  prompt: "Explique-moi ce concept de façon simple" },
    { icon: BookOpen,  label: "Résumé",     prompt: "Fais un résumé structuré en points clés" },
    { icon: HelpCircle,label: "Quiz",       prompt: "Génère 3 questions de révision sur ce sujet" },
    { icon: Sparkles,  label: "Exemples",   prompt: "Donne 3 exemples concrets et réels" },
    { icon: Calculator,label: "Exercice",   prompt: "Propose un exercice pratique" },
    { icon: Map,       label: "Mind map",   prompt: "Crée une carte mentale des concepts clés" },
  ],
  document: [
    { icon: BookOpen,   label: "Résumé",          prompt: "Fais un résumé complet de ce document",        action: "summarize" },
    { icon: HelpCircle, label: "QCM",              prompt: "Génère 5 questions QCM sur ce document",       action: "quiz" },
    { icon: Lightbulb,  label: "Concepts clés",    prompt: "Quels sont les concepts clés de ce document ?" },
    { icon: Sparkles,   label: "Exemples",          prompt: "Donne des exemples basés sur ce document" },
    { icon: Languages,  label: "Simplifier",        prompt: "Explique ce document de façon très simple" },
    { icon: FileSearch, label: "Points importants", prompt: "Quels sont les points les plus importants ?" },
  ],
  course: [
    { icon: Lightbulb,  label: "Expliquer", prompt: "Explique-moi ce chapitre simplement" },
    { icon: BookOpen,   label: "Résumé",    prompt: "Résume les points clés de ce cours" },
    { icon: HelpCircle, label: "Quiz",      prompt: "Génère 3 questions de révision sur ce cours" },
    { icon: Calculator, label: "Exercice",  prompt: "Donne-moi un exercice pratique sur ce cours" },
    { icon: Sparkles,   label: "Astuces",   prompt: "Donne des astuces pour mémoriser ce contenu" },
    { icon: Map,        label: "Plan",      prompt: "Fais le plan structuré de ce cours" },
  ],
};

function MsgBubble({ msg, isStreaming }: { msg: AIMessage; isStreaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] shadow">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-white"
            : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
        }`}
      >
        {msg.content}
        {isStreaming && !isUser && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current opacity-70" />
        )}
      </div>
    </div>
  );
}

export default function AIPanelChat({
  isOpen,
  onClose,
  contextCourse,
  contextCoursId,
  contextCourseId,
  contextChapterId,
  mode = "assistant",
}: AIPanelChatProps) {
  const [messages, setMessages]       = useState<AIMessage[]>([]);
  const [input, setInput]             = useState("");
  const [isStreaming, setIsStreaming]  = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const prevModeRef    = useRef<AIMode>(mode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Reset conversation when mode changes
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      setMessages([]);
      setInput("");
      setConversationId(null);
      prevModeRef.current = mode;
    }
  }, [mode]);

  // Reset conversation when course/chapter changes
  useEffect(() => {
    setMessages([]);
    setConversationId(null);
  }, [contextCourseId, contextChapterId]);

  const config       = MODE_CONFIG[mode];
  const quickActions = quickActionsByMode[mode];
  const Icon         = config.icon;

  const addBotStreaming = useCallback((id: string) => {
    setMessages((prev) => [
      ...prev,
      { id, role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);
  }, []);

  const appendToBot = useCallback((id: string, delta: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m)),
    );
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setInput("");
    setConversationId(null);
  }, []);

  const sendMessage = async (text: string, action?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: AIMessage = {
      id:        `u-${Date.now()}`,
      role:      "user",
      content:   trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const botId = `a-${Date.now()}`;
    setStreamingId(botId);

    try {
      if (!isAuthenticated()) {
        addBotStreaming(botId);
        appendToBot(botId, "Veuillez vous connecter pour utiliser l'assistant IA.");
        return;
      }

      // ── Résumé / quiz document — appels bloquants ─────────────────────────────
      if (contextCoursId && action === "summarize") {
        addBotStreaming(botId);
        try {
          const res = await apiSummarizeCours(contextCoursId);
          appendToBot(botId, res.summary || "Résumé généré.");
        } catch (err) {
          appendToBot(botId, `Erreur lors du résumé : ${err instanceof Error ? err.message : "inconnu"}`);
        }
        return;
      }
      if (contextCoursId && action === "quiz") {
        addBotStreaming(botId);
        try {
          const res = await apiGenerateQuestions(contextCoursId);
          const q = res.questions;
          appendToBot(botId, typeof q === "string" ? q : JSON.stringify(q, null, 2));
        } catch (err) {
          appendToBot(botId, `Erreur lors du quiz : ${err instanceof Error ? err.message : "inconnu"}`);
        }
        return;
      }

      // ── Streaming chat enrichi ────────────────────────────────────────────────
      addBotStreaming(botId);
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      for await (const delta of apiAIChatStream(trimmed, {
        coursId:         contextCoursId,
        courseId:        contextCourseId,
        chapterId:       contextChapterId,
        history,
        mode,
        conversationId:  conversationId ?? undefined,
        onConversationId: (id) => setConversationId(id),
      })) {
        appendToBot(botId, delta);
      }
    } catch (err) {
      appendToBot(
        botId,
        `Désolé, une erreur s'est produite. ${err instanceof Error ? err.message : "Veuillez réessayer."}`,
      );
    } finally {
      setIsStreaming(false);
      setStreamingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0f1219]">
        {/* Header */}
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-[#0f1219]">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} shadow`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{config.title}</p>
            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
              {isStreaming ? (
                <span className="animate-pulse font-medium text-emerald-500">● En train de répondre…</span>
              ) : contextCourse ? (
                contextCourse.slice(0, 36) + (contextCourse.length > 36 ? "…" : "")
              ) : (
                "Posez vos questions pédagogiques"
              )}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={startNewConversation}
              title="Nouvelle conversation"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              title="Fermer"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Welcome bubble */}
          {messages.length === 0 && !isStreaming && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${config.color}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{config.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {mode === "document" && contextCoursId
                  ? `Document chargé : « ${contextCourse ?? `Document #${contextCoursId}`} ». Je peux le résumer, générer des questions ou répondre à vos questions dessus.`
                  : mode === "course" && contextCourse
                  ? `Je suis votre tuteur pour le cours « ${contextCourse} ». Je connais votre progression et vos difficultés. Posez vos questions !`
                  : "Bonjour ! Je suis votre professeur IA Zentrix. Je connais votre cours, votre niveau et votre progression. Posez-moi n'importe quelle question — je suis là pour vous aider à apprendre, réviser et progresser."}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MsgBubble
              key={msg.id}
              msg={msg}
              isStreaming={isStreaming && msg.id === streamingId}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-[#0f1219]">
          {/* Quick actions */}
          <div
            className="mb-2 flex gap-1.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {quickActions.map((a) => {
              const QIcon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => sendMessage(a.prompt, a.action)}
                  disabled={isStreaming}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-[#FF6B00] hover:bg-orange-50 hover:text-[#FF6B00] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <QIcon className="h-3 w-3" />
                  {a.label}
                </button>
              );
            })}
          </div>

          {/* Text input */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={isStreaming ? "En train de répondre…" : config.placeholder}
              disabled={isStreaming}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF6B00] focus:bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} text-white shadow transition-all hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
