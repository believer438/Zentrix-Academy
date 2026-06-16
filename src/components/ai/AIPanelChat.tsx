import { useRef, useEffect, useState, useCallback } from "react";
import {
  X, Sparkles, Bot, Plus, FileSearch, Brain,
  ArrowUp, Square, Paperclip, FileText,
} from "lucide-react";
import { type AIMessage } from "@/lib/backend-types";
import {
  apiAIChatStream,
  apiUploadCours,
  isAuthenticated,
} from "@/lib/api-client";
import { getPageContext } from "@/hooks/usePageContext";
import AIMarkdown from "@/components/ai/AIMarkdown";

export type AIMode = "assistant" | "document" | "course";

// ── Guest-mode: track turns for friendly login nudge ─────────────────────────
// Nudge shown on 1st response and every 5th response after (no hard limit).
const GUEST_TURN_KEY = "zentrix_ai_guest_turns";
const getGuestTurns  = () => parseInt(localStorage.getItem(GUEST_TURN_KEY) ?? "0", 10);
const incrGuestTurns = () => {
  const n = getGuestTurns() + 1;
  localStorage.setItem(GUEST_TURN_KEY, String(n));
  return n;
};
const shouldNudge = (turn: number) => turn === 1 || (turn > 1 && (turn - 1) % 5 === 0);

interface AIPanelChatProps {
  isOpen:            boolean;
  onClose:           () => void;
  contextCourse?:    string;
  contextCoursId?:   number;
  contextCourseId?:  number;
  contextChapterId?: number;
  mode?:             AIMode;
  push?:             boolean;
}

const MODE_CONFIG: Record<AIMode, {
  title:       string;
  icon:        typeof Bot;
  color:       string;
  placeholder: string;
}> = {
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

// ── Attached file ─────────────────────────────────────────────────────────────
interface AttachedFile {
  file:      File;
  type:      "image" | "pdf";
  preview?:  string;
  base64?:   string;
  mimeType?: string;
}

// ── Streaming plain-text renderer (fast — no Markdown parse) ──────────────────
function StreamingText({ content }: { content: string }) {
  return (
    <span className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {content}
      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-[pulse_0.8s_ease-in-out_infinite] bg-[#FF6B00] align-middle" />
    </span>
  );
}

// ── Thinking dots ─────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[#FF6B00]/70 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-[#FF6B00]/70 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-[#FF6B00]/70 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 italic">L'IA analyse votre contexte…</span>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MsgBubble({ msg, isStreaming }: { msg: AIMessage; isStreaming?: boolean }) {
  const isUser     = msg.role === "user";
  const isThinking = isStreaming && !msg.content;

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] shadow transition-all ${isThinking ? "animate-pulse" : ""}`}>
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-white whitespace-pre-wrap"
            : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
        }`}
      >
        {isUser ? (
          <>{msg.content}</>
        ) : isThinking ? (
          <ThinkingDots />
        ) : isStreaming && msg.content ? (
          <StreamingText content={msg.content} />
        ) : isThinking || (isStreaming && !msg.content) ? (
          <ThinkingDots />
        ) : (
          <AIMarkdown content={msg.content} isStreaming={false} />
        )}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AIPanelChat({
  isOpen,
  onClose,
  contextCourse,
  contextCoursId,
  contextCourseId,
  contextChapterId,
  mode  = "assistant",
  push  = false,
}: AIPanelChatProps) {
  const [messages,        setMessages]        = useState<AIMessage[]>([]);
  const [input,           setInput]           = useState("");
  const [isStreaming,     setIsStreaming]      = useState(false);
  const [isThinking,      setIsThinking]      = useState(false);
  const [streamingId,     setStreamingId]     = useState<string | null>(null);
  const [conversationId,  setConversationId]  = useState<number | null>(null);
  const [attachedFile,    setAttachedFile]    = useState<AttachedFile | null>(null);
  const [uploadingPdf,    setUploadingPdf]    = useState(false);

  // ── Document context from current page (DocumentAIPage) ──────────────────
  const [pageDocCtx, setPageDocCtx] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const ctx = getPageContext();
    const docId = ctx?.page_data?.document_id;
    const docView = ctx?.page_data?.view as string | undefined;
    if (
      ctx?.current_page === "document-ai" &&
      typeof docId === "number" &&
      (docView === "results" || docView === "saved")
    ) {
      setPageDocCtx({
        id:    docId,
        title: (ctx.page_data.document_title as string | null) || `Document #${docId}`,
      });
    } else {
      setPageDocCtx(null);
    }
  }, [isOpen]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const botIdRef           = useRef<string | null>(null);
  const messagesEndRef     = useRef<HTMLDivElement>(null);
  const inputRef           = useRef<HTMLInputElement>(null);
  const fileInputRef       = useRef<HTMLInputElement>(null);
  const prevModeRef        = useRef<AIMode>(mode);

  // ── Token buffer for smooth streaming ─────────────────────────────────────
  const tokenBufferRef = useRef<string>("");
  const rafRef         = useRef<number | null>(null);

  const drainBuffer = useCallback(() => {
    if (!tokenBufferRef.current) {
      rafRef.current = null;
      return;
    }
    // Reveal up to 5 chars per frame (~300 chars/sec at 60fps)
    // This smooths out burst delivery from the backend
    const take = tokenBufferRef.current.slice(0, 5);
    tokenBufferRef.current = tokenBufferRef.current.slice(5);
    const botId = botIdRef.current;
    if (botId) {
      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, content: m.content + take } : m)
      );
    }
    rafRef.current = requestAnimationFrame(drainBuffer);
  // setMessages is stable from useState — no deps needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Reset conversation on mode change
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      setMessages([]);
      setInput("");
      setConversationId(null);
      prevModeRef.current = mode;
    }
  }, [mode]);

  // Reset on course/chapter change
  useEffect(() => {
    setMessages([]);
    setConversationId(null);
  }, [contextCourseId, contextChapterId]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview);
    };
  }, [attachedFile]);

  // Abort stream on unmount
  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const config = MODE_CONFIG[mode];
  const Icon   = config.icon;

  // ── Stop streaming ──────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setIsThinking(false);
    setStreamingId(null);
    botIdRef.current = null;
  }, []);

  // ── New conversation ────────────────────────────────────────────────────────
  const startNewConversation = useCallback(() => {
    handleStop();
    setMessages([]);
    setInput("");
    setConversationId(null);
    setAttachedFile(null);
  }, [handleStop]);

  // ── File picker ─────────────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl  = reader.result as string;
        const [header, base64] = dataUrl.split(",");
        const mimeType = header.match(/data:([^;]+)/)?.[1] ?? file.type;
        const preview  = URL.createObjectURL(file);
        setAttachedFile({ file, type: "image", preview, base64, mimeType });
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      if (!isAuthenticated()) {
        setAttachedFile({ file, type: "pdf" });
        return;
      }
      setUploadingPdf(true);
      try {
        const res    = await apiUploadCours(file.name.replace(/\.pdf$/i, ""), file);
        const coursId = res.cours.id;
        const sysMsg: AIMessage = {
          id:        `sys-${Date.now()}`,
          role:      "assistant",
          content:   `📄 **Document chargé :** *${file.name}*\n\nJe peux maintenant répondre à vos questions sur ce document. Que voulez-vous savoir ?`,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, sysMsg]);
        setAttachedFile({ file, type: "pdf", base64: String(coursId), mimeType: "pdf" });
      } catch {
        setAttachedFile({ file, type: "pdf" });
      } finally {
        setUploadingPdf(false);
      }
    }
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────── 
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && !attachedFile) || isStreaming) return;

    const displayText = trimmed || (attachedFile ? `[${attachedFile.file.name}]` : "");

    // Add user message
    const userMsg: AIMessage = {
      id:        `u-${Date.now()}`,
      role:      "user",
      content:   displayText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Capture and clear attachment
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    // Create bot message placeholder (empty — will fill via streaming)
    const botId = `a-${Date.now()}`;
    botIdRef.current = botId;
    setIsStreaming(true);
    setStreamingId(botId);
    setMessages(prev => [
      ...prev,
      { id: botId, role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build context
      const history      = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const pageCtx      = getPageContext();
      const selectedText = (typeof window !== "undefined" ? window.getSelection()?.toString().trim() : "") ?? "";
      if (pageCtx && selectedText) {
        pageCtx.page_data = { ...pageCtx.page_data, selected_text: selectedText };
      }

      let iaPrefs = { defaultLevel: "intermediaire", responseLanguage: "fr", proactiveHints: true };
      try {
        const raw = localStorage.getItem("zentrix-ia-prefs");
        if (raw) iaPrefs = { ...iaPrefs, ...JSON.parse(raw) };
      } catch { /* ignore */ }

      const imageB64      = currentAttachment?.type === "image" ? currentAttachment.base64 : undefined;
      const imageMime     = currentAttachment?.type === "image" ? currentAttachment.mimeType : undefined;

      // Resolve document ID: attached PDF > prop > page context (DocumentAIPage)
      const activeCorsId  = currentAttachment?.type === "pdf" && currentAttachment.mimeType === "pdf"
        ? parseInt(currentAttachment.base64 ?? "0", 10) || undefined
        : contextCoursId ?? pageDocCtx?.id ?? undefined;

      // Auto-switch to document mode when document comes from page context
      const effectiveMode = (!contextCoursId && pageDocCtx?.id && activeCorsId === pageDocCtx.id)
        ? "document"
        : mode;

      // Show thinking dots until first token
      setIsThinking(true);
      let firstToken = true;

      // ── Stream tokens into RAF buffer — smooth typewriter effect ──────────
      tokenBufferRef.current = "";
      for await (const delta of apiAIChatStream(trimmed || "Analyse ce fichier.", {
        coursId:          activeCorsId,
        courseId:         contextCourseId,
        chapterId:        contextChapterId,
        history,
        mode:             effectiveMode,
        conversationId:   conversationId ?? undefined,
        onConversationId: (id) => setConversationId(id),
        pageContext:      pageCtx,
        userContext: {
          ia_level:           iaPrefs.defaultLevel,
          ia_language:        iaPrefs.responseLanguage,
          ia_proactive_hints: iaPrefs.proactiveHints,
        },
        signal:       controller.signal,
        image_base64: imageB64,
        image_type:   imageMime,
      })) {
        if (controller.signal.aborted) break;

        // Hide thinking dots on first real token
        if (firstToken) {
          setIsThinking(false);
          firstToken = false;
        }

        // Accumulate in buffer; RAF loop drains at ~60fps for smooth reveal
        tokenBufferRef.current += delta;
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(drainBuffer);
        }
      }

      // ── Guest login nudge — shown on 1st response and every 5th after ─────
      if (!isAuthenticated() && !controller.signal.aborted) {
        const turn = incrGuestTurns();
        if (shouldNudge(turn)) {
          const nudge =
            "\n\n---\n*💡 **Conseil :** Vous pouvez vous connecter pour une expérience personnalisée — " +
            "il suffit de votre **nom, email et mot de passe**. " +
            "Je mémoriserai alors votre progression et vos difficultés pour vous accompagner encore mieux !*";
          setMessages(prev =>
            prev.map(m => m.id === botId ? { ...m, content: m.content + nudge } : m)
          );
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped — flush remaining buffer and keep what we have
      } else {
        const errText = err instanceof Error ? err.message : "Veuillez réessayer.";
        setMessages(prev =>
          prev.map(m => m.id === botId
            ? { ...m, content: m.content || `Désolé, une erreur s'est produite. ${errText}` }
            : m
          )
        );
      }
    } finally {
      // Cancel RAF drain loop and flush any remaining buffered tokens immediately
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const remaining = tokenBufferRef.current;
      tokenBufferRef.current = "";
      if (remaining && botIdRef.current) {
        const fId = botIdRef.current;
        setMessages(prev =>
          prev.map(m => m.id === fId ? { ...m, content: m.content + remaining } : m)
        );
      }
      setIsStreaming(false);
      setIsThinking(false);
      setStreamingId(null);
      botIdRef.current = null;
    }
  }, [
    attachedFile, isStreaming, messages, mode,
    conversationId, contextCoursId, contextCourseId, contextChapterId,
  ]);

  if (!isOpen) return null;

  // ── Panel body ────────────────────────────────────────────────────────────────
  const panelInner = (
    <>
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-[#0f1219]">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} shadow`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{config.title}</p>
          <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
            {isThinking ? (
              <span className="animate-pulse font-medium text-amber-500">◈ L'IA analyse votre contexte…</span>
            ) : isStreaming ? (
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
        {messages.length === 0 && !isStreaming && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${config.color}`}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{config.title}</p>
            </div>

            {/* Document context badge — visible when a doc is open on DocumentAIPage */}
            {pageDocCtx && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                <span className="text-sm">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {pageDocCtx.title}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                    Document chargé · Je peux répondre à toutes vos questions dessus
                  </p>
                </div>
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <span className="text-[8px] font-black text-white">✓</span>
                </span>
              </div>
            )}

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {pageDocCtx
                ? `💡 Je lis le contenu complet de « ${pageDocCtx.title} ». Posez-moi n'importe quelle question dessus : résumé, points clés, explications, quiz…`
                : mode === "document" && contextCoursId
                ? `Document chargé : « ${contextCourse ?? `Document #${contextCoursId}`} ». Je peux le résumer, générer des questions ou répondre à vos questions dessus.`
                : mode === "course" && contextCourse
                ? `Je suis votre tuteur pour le cours « ${contextCourse} ». Je connais votre progression et vos difficultés. Posez vos questions !`
                : "Bonjour ! Je suis votre professeur IA Zentrix. Posez-moi n'importe quelle question — je suis là pour vous aider à apprendre, réviser et progresser. Vous pouvez aussi joindre une image ou un PDF avec le bouton + ."}
            </p>
          </div>
        )}

        {messages.map(msg => (
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

        {/* File preview */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            {attachedFile.type === "image" && attachedFile.preview ? (
              <img
                src={attachedFile.preview}
                alt="preview"
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {attachedFile.file.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {attachedFile.type === "image" ? "Image (vision IA)" : "PDF chargé"}
              </p>
            </div>
            <button
              onClick={() => {
                if (attachedFile.preview) URL.revokeObjectURL(attachedFile.preview);
                setAttachedFile(null);
              }}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1 transition-colors focus-within:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800">
          {/* + button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || uploadingPdf}
            title="Joindre une image ou un PDF"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-[#FF6B00] disabled:opacity-40 dark:hover:bg-slate-700"
          >
            {uploadingPdf
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              : <Sparkles className="h-4 w-4" />
            }
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />

          {/* Text input */}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder={
              isStreaming
                ? "En train de répondre…"
                : attachedFile
                ? "Posez une question sur ce fichier…"
                : config.placeholder
            }
            disabled={isStreaming}
            className="flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50 dark:text-white dark:placeholder-slate-500"
          />

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              title="Arrêter la réponse"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-white transition-all hover:bg-slate-900 dark:bg-slate-500 dark:hover:bg-slate-400"
            >
              <Square className="h-3 w-3 fill-white stroke-none" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() && !attachedFile}
              title="Envoyer (Entrée)"
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} text-white shadow transition-all hover:shadow-md disabled:opacity-40 disabled:hover:shadow-none`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">
          Entrée pour envoyer · + pour joindre image/PDF
        </p>
      </div>
    </>
  );

  if (push) {
    return (
      <aside className="flex h-full w-full flex-col bg-white dark:bg-[#0f1219]">
        {panelInner}
      </aside>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0f1219]">
        {panelInner}
      </aside>
    </>
  );
}
