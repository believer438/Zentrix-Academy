import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Bot,
  ChevronDown,
  Maximize2,
  Minimize2,
  Languages,
  Map,
  Calculator,
  FileSearch,
  GripHorizontal,
  Plus,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  PhoneCall,
  PanelLeft,
} from "lucide-react";
import { type AIMessage } from "@/lib/backend-types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AIPhoneChatProps {
  isOpen: boolean;
  onClose: () => void;
  contextCourse?: string;
}

type DeviceMode = "phone" | "tablet";
type ScreenView = "chat" | "calling" | "in-call";

const PHONE_W = 320;
const PHONE_H = 620;

const quickActions = [
  { icon: Lightbulb, label: "Explique", prompt: "Explique-moi simplement ce concept" },
  { icon: BookOpen, label: "Resume", prompt: "Fais un resume concis de cette lecon" },
  { icon: HelpCircle, label: "Quiz", prompt: "Genere 3 questions de quiz sur ce sujet" },
  { icon: Sparkles, label: "Exemples", prompt: "Donne 3 exemples concrets et reels" },
  { icon: Languages, label: "Traduire", prompt: "Traduis les termes techniques en francais simple" },
  { icon: Map, label: "Mind map", prompt: "Cree une carte mentale des concepts cles" },
  { icon: Calculator, label: "Calcul", prompt: "Guide-moi dans les calculs de ce cours" },
  { icon: FileSearch, label: "Recherche", prompt: "Quelles ressources pour approfondir ce sujet ?" },
];

function MsgText({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        if (parts.length > 1) {
          return (
            <p key={i} className="leading-snug text-[11px]">
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
            </p>
          );
        }
        return <p key={i} className="leading-snug text-[11px]">{line}</p>;
      })}
    </div>
  );
}

function CallTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return <span className="text-white/70 text-sm tabular-nums">{m}:{s}</span>;
}

export default function AIPhoneChat({ isOpen, onClose, contextCourse }: AIPhoneChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [mode, setMode] = useState<DeviceMode>("phone");
  const [screen, setScreen] = useState<ScreenView>("chat");
  const [callMuted, setCallMuted] = useState(false);
  const [callSpeaker, setCallSpeaker] = useState(false);
  const [callVideo, setCallVideo] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  // Position — start centered-right
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobileViewport = viewport.width < 768;

  const getPhoneDims = () => {
    const vw = viewport.width;
    const vh = viewport.height;
    return {
      w: Math.min(PHONE_W, Math.max(280, vw - 16)),
      h: Math.min(PHONE_H, Math.max(520, vh - 16)),
    };
  };

  // Viewport-safe dimensions for tablet
  const getTabletDims = () => {
    const vw = viewport.width;
    const vh = viewport.height;
    const w = Math.min(660, vw - 32);
    const h = Math.min(820, vh - 32);
    return { w, h };
  };

  const W = isMobileViewport ? viewport.width : mode === "tablet" ? getTabletDims().w : getPhoneDims().w;
  const H = isMobileViewport ? viewport.height : mode === "tablet" ? getTabletDims().h : getPhoneDims().h;

  useEffect(() => {
    const onResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobileViewport || pos.x === -1) {
      const phoneDims = getPhoneDims();
      setPos({
        x: isMobileViewport ? 0 : Math.max(8, viewport.width - phoneDims.w - 24),
        y: isMobileViewport ? 0 : Math.max(8, (viewport.height - phoneDims.h) / 2),
      });
    }
  }, [isMobileViewport, viewport.height, viewport.width]);

  useEffect(() => {
    if (pos.x === -1) return;
    setPos((p) => ({
      x: isMobileViewport ? 0 : Math.max(0, Math.min(p.x, viewport.width - W - 8)),
      y: isMobileViewport ? 0 : Math.max(8, Math.min(p.y, viewport.height - H - 8)),
    }));
  }, [H, W, isMobileViewport, mode, viewport.height, viewport.width]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - (containerRef.current?.getBoundingClientRect().left ?? 0),
      y: e.clientY - (containerRef.current?.getBoundingClientRect().top ?? 0),
    };
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      dragging.current = false;
      return;
    }

    const W_curr = mode === "tablet" ? getTabletDims().w : getPhoneDims().w;
    const H_curr = mode === "tablet" ? getTabletDims().h : getPhoneDims().h;
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - W_curr)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - H_curr)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isMobileViewport, mode, viewport.height, viewport.width]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (screen !== "calling") return;

    const timeout = window.setTimeout(() => {
      setScreen("in-call");
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [screen]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: trimmed, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setIsTyping(true);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setScreen("chat");
  };

  if (!isOpen || (!isMobileViewport && pos.x === -1)) return null;

  const isTablet = !isMobileViewport && mode === "tablet";
  const borderRadius = isMobileViewport ? 0 : isTablet ? 28 : 44;
  const screenRadius = isMobileViewport ? 0 : isTablet ? 22 : 38;
  const frameInset = isMobileViewport ? 0 : isTablet ? 10 : 8;

  return (
    <>
    <div
      ref={containerRef}
      className={`fixed z-50 ${isMobileViewport ? "" : "select-none"}`}
      style={isMobileViewport ? { inset: 0, width: W, height: H } : { left: pos.x, top: pos.y, width: W, height: H }}
    >
      {/* Glow */}
      {!isMobileViewport && (
        <div className="absolute inset-0 pointer-events-none" style={{
          borderRadius,
          boxShadow: screen === "in-call"
            ? "0 0 80px rgba(34,197,94,0.35)"
            : "0 0 60px rgba(99,102,241,0.35)",
        }} />
      )}

      {/* Frame */}
      {!isMobileViewport && (
        <div className="absolute inset-0" style={{
          borderRadius,
          background: "linear-gradient(160deg,#1c1c28 0%,#13131c 60%,#0d0d14 100%)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 0 ${frameInset}px #111114, 0 0 0 ${frameInset + 1}px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.75)`,
        }} />
      )}

      {/* Side buttons (phone only) */}
      {!isMobileViewport && !isTablet && (
        <>
          {[{ top: 110, h: 28 }, { top: 150, h: 56 }, { top: 218, h: 56 }].map((b, i) => (
            <div key={i} className="absolute" style={{ left: -3, top: b.top, width: 3, height: b.h, background: "#111", borderRadius: "2px 0 0 2px" }} />
          ))}
          <div className="absolute" style={{ right: -3, top: 168, width: 3, height: 76, background: "#111", borderRadius: "0 2px 2px 0" }} />
        </>
      )}

      {/* Screen */}
      <div className="absolute flex flex-col overflow-hidden" style={{
        inset: frameInset,
        borderRadius: screenRadius,
        background: "#000",
      }}>
        {/* ─── CALLING SCREEN ─── */}
        {screen === "calling" && (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(180deg,#0f1117 0%,#050508 100%)" }}>
            {/* Animated rings */}
            {[1, 2, 3].map((r) => (
              <div key={r} className="absolute rounded-full border border-indigo-500/20 animate-ping"
                style={{ width: 80 + r * 60, height: 80 + r * 60, animationDelay: `${r * 0.3}s`, animationDuration: "2s" }} />
            ))}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 0 40px rgba(99,102,241,0.5)" }}>
                <Bot className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-bold">Assistant IA</p>
                <p className="text-indigo-300 text-sm mt-1 animate-pulse">Appel en cours...</p>
                {contextCourse && <p className="text-white/40 text-xs mt-0.5 truncate px-4">{contextCourse}</p>}
              </div>
            </div>
            {/* End call */}
            <div className="absolute bottom-8 flex items-center">
              <button onClick={() => { setScreen("chat"); }}
                className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#ef4444", boxShadow: "0 6px 20px rgba(239,68,68,0.5)" }}>
                  <PhoneOff className="w-7 h-7 text-white" />
                </div>
                <span className="text-white/60 text-xs">Annuler</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── IN-CALL SCREEN ─── */}
        {screen === "in-call" && (
          <div className="flex-1 flex flex-col items-center relative overflow-hidden"
            style={{ background: "linear-gradient(180deg,#0a0a14 0%,#050508 100%)" }}>
            {/* Background blur effect */}
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }} />

            {/* Top info */}
            <div className="relative z-10 flex flex-col items-center pt-8 gap-2">
              <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Appel IA Vocal</p>
              <p className="text-white text-xl font-bold">Assistant IA</p>
              <p className="text-indigo-300 text-xs">En attente de la reponse...</p>
              <CallTimer />
            </div>

            {/* Avatar */}
            <div className="relative z-10 mt-6">
              <div className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 0 50px rgba(99,102,241,0.4)" }}>
                <Bot className="w-14 h-14 text-white" />
              </div>
              {/* Sound waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2].map((r) => (
                  <div key={r} className="absolute rounded-full border border-indigo-400/15 animate-ping"
                    style={{ width: 112 + r * 32, height: 112 + r * 32, animationDelay: `${r * 0.5}s`, animationDuration: "2.5s" }} />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 mt-8 grid grid-cols-3 gap-5 px-6">
              {[
                { icon: callMuted ? MicOff : Mic, label: callMuted ? "Activer" : "Sourdine", active: callMuted, action: () => setCallMuted(!callMuted) },
                { icon: callSpeaker ? Volume2 : VolumeX, label: "Haut-parleur", active: callSpeaker, action: () => setCallSpeaker(!callSpeaker) },
                { icon: callVideo ? Video : VideoOff, label: "Video", active: callVideo, action: () => setCallVideo(!callVideo) },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                      style={{ background: btn.active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)", border: btn.active ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)" }}>
                      <Icon className={`w-6 h-6 ${btn.active ? "text-indigo-300" : "text-white/70"}`} />
                    </div>
                    <span className="text-white/50 text-[10px]">{btn.label}</span>
                  </button>
                );
              })}
            </div>

            {/* End call */}
            <div className="relative z-10 mt-6 flex flex-col items-center gap-1">
              <button onClick={() => setScreen("chat")}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#ef4444", boxShadow: "0 8px 24px rgba(239,68,68,0.45)" }}>
                  <PhoneOff className="w-7 h-7 text-white" />
                </div>
              </button>
              <span className="text-white/40 text-xs mt-1">Terminer</span>
            </div>

            {/* Switch to chat */}
            <button onClick={() => setScreen("chat")}
              className="relative z-10 mt-3 text-indigo-300/60 text-xs hover:text-indigo-300 transition-colors">
              ← Retour au chat
            </button>
          </div>
        )}

        {/* ─── CHAT SCREEN ─── */}
        {screen === "chat" && (
          <>
            {/* Header — draggable */}
            <div
              className={`flex items-center gap-2.5 px-3 py-2 flex-shrink-0 relative ${isMobileViewport ? "" : "cursor-grab active:cursor-grabbing"}`}
              style={{ background: "linear-gradient(180deg,#0f1117 0%,#0a0c14 100%)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              onMouseDown={isMobileViewport ? undefined : onMouseDown}
            >
              {!isMobileViewport && (
                <GripHorizontal className="absolute left-1/2 -translate-x-1/2 top-1" style={{ width: 14, height: 14, color: "rgba(255,255,255,0.12)" }} />
              )}

              <button
                onClick={() => setInfoOpen(true)}
                className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 transition-all hover:bg-white/10"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                title="Informations"
              >
                <div className="flex flex-col gap-1">
                  <span className="block h-[2px] w-4 rounded-full bg-white/90" />
                  <span className="block h-[2px] w-3 rounded-full bg-indigo-300" />
                  <span className="block h-[2px] w-4 rounded-full bg-white/70" />
                </div>
                <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate" style={{ fontSize: isTablet ? 13 : 11 }}>Assistant IA</p>
                <p style={{ fontSize: 9, color: "#22c55e" }}>
                  {contextCourse ? contextCourse.slice(0, isTablet ? 45 : 24) + "…" : "En ligne · disponible"}
                </p>
              </div>

              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <button
                  onClick={startNewChat}
                  className="flex items-center justify-center rounded-full transition-all hover:opacity-80"
                  style={{ width: 26, height: 26, background: "rgba(255,255,255,0.07)" }}
                  title="Nouveau chat"
                >
                  <Plus style={{ width: 12, height: 12, color: "rgba(255,255,255,0.78)" }} />
                </button>
                {/* Call button */}
                <button
                  onClick={() => setScreen("calling")}
                  className="flex items-center justify-center rounded-full transition-all hover:opacity-80"
                  style={{ width: 26, height: 26, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                  title="Appel vocal IA"
                >
                  <PhoneCall style={{ width: 11, height: 11, color: "#22c55e" }} />
                </button>
                {!isMobileViewport && (
                  <button
                    onClick={() => setMode(mode === "phone" ? "tablet" : "phone")}
                    className="flex items-center justify-center rounded-full transition-all hover:opacity-80"
                    style={{ width: 26, height: 26, background: "rgba(255,255,255,0.07)" }}
                    title={mode === "phone" ? "Mode tablette" : "Mode telephone"}
                  >
                    {mode === "phone"
                      ? <Maximize2 style={{ width: 10, height: 10, color: "rgba(255,255,255,0.65)" }} />
                      : <Minimize2 style={{ width: 10, height: 10, color: "rgba(255,255,255,0.65)" }} />
                    }
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full transition-all hover:opacity-80"
                  style={{ width: 26, height: 26, background: "rgba(255,255,255,0.07)" }}
                >
                  <ChevronDown style={{ width: 12, height: 12, color: "rgba(255,255,255,0.65)" }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5"
              style={{ background: "linear-gradient(180deg,#090b10 0%,#0b0e16 100%)", scrollbarWidth: "none" }}>
              {messages.length === 0 && !isTyping && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/75">
                  <p className="text-sm font-semibold">Assistant IA en attente</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                    Ecrivez votre message et attendez la reponse de l'assistant.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-1.5`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 20, height: 20, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", marginBottom: 2 }}>
                      <Bot style={{ width: 10, height: 10, color: "white" }} />
                    </div>
                  )}
                  <div className="px-3 py-2" style={{
                    maxWidth: "82%",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "linear-gradient(135deg,#4f46e5,#6d28d9)" : "rgba(255,255,255,0.07)",
                    border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                    color: msg.role === "user" ? "white" : "rgba(255,255,255,0.85)",
                  }}>
                    <MsgText text={msg.content} />
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-1.5">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                    <Bot style={{ width: 10, height: 10, color: "white" }} />
                  </div>
                  <div className="rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[11px] text-white/70">Reponse de l'IA en attente...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className="px-2.5 pt-1.5 pb-1 flex gap-1.5 overflow-x-auto flex-shrink-0"
              style={{ background: "#070910", scrollbarWidth: "none" }}>
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={() => sendMessage(a.prompt)} disabled={isTyping}
                    className="flex items-center gap-1 whitespace-nowrap flex-shrink-0 transition-all hover:opacity-85"
                    style={{ padding: "3px 9px", borderRadius: 20, background: "rgba(99,102,241,0.11)", border: "1px solid rgba(99,102,241,0.22)", color: "rgba(165,180,252,0.9)", fontSize: 10, fontWeight: 500, opacity: isTyping ? 0.45 : 1 }}>
                    <Icon style={{ width: 9, height: 9 }} />
                    {a.label}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-1.5 flex-shrink-0" style={{ background: "#070910" }}>
              <button onClick={() => setMicActive(!micActive)} className="flex items-center justify-center rounded-full flex-shrink-0 transition-all"
                style={{ width: 32, height: 32, background: micActive ? "#ef4444" : "rgba(255,255,255,0.07)", boxShadow: micActive ? "0 0 12px rgba(239,68,68,0.4)" : "none" }}>
                <Mic style={{ width: 13, height: 13, color: micActive ? "white" : "rgba(255,255,255,0.4)" }} />
              </button>
              <div className="flex-1 flex items-center rounded-full px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Posez votre question..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent focus:outline-none min-w-0"
                  style={{ color: "white", fontSize: 11, caretColor: "#6366f1" }}
                />
              </div>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
                className="flex items-center justify-center rounded-full flex-shrink-0 transition-all"
                style={{ width: 32, height: 32, background: input.trim() && !isTyping ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(255,255,255,0.07)", boxShadow: input.trim() && !isTyping ? "0 4px 12px rgba(99,102,241,0.35)" : "none", opacity: input.trim() && !isTyping ? 1 : 0.45 }}>
                <Send style={{ width: 12, height: 12, color: "white" }} />
              </button>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center pb-2 flex-shrink-0" style={{ background: "#070910" }}>
              <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)" }} />
            </div>
          </>
        )}
      </div>
    </div>

    <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
      <SheetContent side="left" className="border-slate-800 bg-[#090b10] text-white sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            <PanelLeft className="h-4 w-4 text-indigo-300" />
            Informations IA
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Vue rapide du contexte et des actions disponibles.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contexte</p>
            <p className="mt-2 text-sm font-medium text-white">
              {contextCourse || "Aucun cours selectionne"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Etat</p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Chat IA</span>
                <span className="text-emerald-300">Disponible</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Historique</span>
                <span className="text-slate-400">{messages.length} message(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mode</span>
                <span className="text-slate-300">{isMobileViewport ? "Plein ecran" : mode === "tablet" ? "Tablette" : "Telephone"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Raccourcis</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div>Explique un concept</div>
              <div>Cree un quiz</div>
              <div>Demande une synthese</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}

export function AIPhoneToggle({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  if (isOpen) return null;
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
        boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
      }}
    >
      <div className="relative">
        <Phone style={{ width: 17, height: 17, color: "white" }} />
        <div className="absolute -top-1 -right-1 rounded-full border border-white animate-pulse" style={{ width: 8, height: 8, background: "#22c55e" }} />
      </div>
      <span className="text-white text-sm font-bold">IA</span>
    </button>
  );
}
