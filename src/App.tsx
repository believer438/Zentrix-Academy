import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import AIPanelChat, { type AIMode } from "@/components/ai/AIPanelChat";
import FirstVisitAuthPanel from "@/components/auth/FirstVisitAuthPanel";
import SiteFooter from "@/components/layout/SiteFooter";
import Dashboard from "@/pages/Dashboard";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetail from "@/pages/CourseDetail";
import DocumentAIPage from "@/pages/DocumentAIPage";
import LibraryPage from "@/pages/LibraryPage";
import QuizzesPage from "@/pages/QuizzesPage";
import RevisionPage from "@/pages/RevisionPage";
import NotesPage from "@/pages/NotesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import { type Course } from "@/lib/backend-types";
import { apiGetMe, clearAuth, isAuthenticated, type UserProfile } from "@/lib/api-client";
import {
  Bot, ChevronDown, Facebook, Instagram, Linkedin, LogOut,
  Menu, Settings, Shield, Sparkles, Twitter, User, X, Youtube,
} from "lucide-react";

const pageToPath: Record<string, string> = {
  dashboard: "/",
  courses: "/courses",
  "document-ai": "/document-ai",
  library: "/library",
  quizzes: "/quizzes",
  revision: "/revision",
  notes: "/notes",
  analytics: "/analytics",
  notifications: "/notifications",
  settings: "/settings",
  admin: "/admin",
  "course-detail": "/course-detail",
};

const primaryNavItems = [
  { id: "dashboard",   label: "Accueil" },
  { id: "courses",     label: "Tous les cours" },
  { id: "document-ai", label: "Document IA" },
  { id: "library",     label: "Bibliothèque" },
  { id: "quizzes",     label: "Quiz" },
  { id: "notes",       label: "Notes" },
];

const FIRST_VISIT_PANEL_KEY = "zentrix_first_visit_auth_panel_seen";
const SESSION_KEYS = [
  "zentrix-token", "zentrix-academy_session",
  "auth_token", "access_token", "session_token",
];

function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  return SESSION_KEYS.some((k) => Boolean(localStorage.getItem(k) || sessionStorage.getItem(k)));
}

function getCurrentPageFromPath(pathname: string): string {
  if (pathname === "/") return "dashboard";
  if (pathname.startsWith("/courses")) return "courses";
  if (pathname.startsWith("/document-ai")) return "document-ai";
  if (pathname.startsWith("/library")) return "library";
  if (pathname.startsWith("/quizzes")) return "quizzes";
  if (pathname.startsWith("/revision")) return "revision";
  if (pathname.startsWith("/notes")) return "notes";
  if (pathname.startsWith("/analytics")) return "analytics";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/course-detail")) return "course-detail";
  return "dashboard";
}

function getAIMode(page: string): AIMode {
  if (page === "document-ai") return "document";
  if (page === "course-detail") return "course";
  return "assistant";
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({
  user, onNavigate, onLogout,
}: {
  user: UserProfile;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const roleLabel: Record<string, string> = {
    admin: "Administrateur", professor: "Professeur", student: "Étudiant",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1.5 transition-colors hover:border-[#FF6B00] dark:border-slate-700"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-[11px] font-bold text-white">
          {initials(user.full_name)}
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
          {user.full_name ?? user.email}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user.full_name ?? "Utilisateur"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              user.role === "admin"
                ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                : user.role === "professor"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            }`}>
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onNavigate("settings"); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Paramètres
            </button>
            {user.role === "admin" && (
              <button
                onClick={() => { setOpen(false); onNavigate("admin"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Shield className="h-4 w-4 text-slate-400" />
                Administration
              </button>
            )}
          </div>
          <div className="border-t border-slate-100 py-1 dark:border-slate-800">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Floating AI button (FAB) ──────────────────────────────────────────────────
function AIFloatingButton({
  onClick, aiOpen,
}: {
  onClick: () => void;
  aiOpen: boolean;
}) {
  if (aiOpen) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 overflow-hidden bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-3 text-white shadow-lg shadow-[#FF6B00]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF6B00]/40 hover:scale-105 active:scale-95"
      style={{ borderRadius: "2rem" }}
      aria-label="Ouvrir l'assistant IA"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-[2rem] animate-ping opacity-20 bg-[#FF6B00]" style={{ animationDuration: "2.5s" }} />
      <Bot className="relative h-5 w-5 flex-shrink-0" />
      <span className="relative text-sm font-bold tracking-wide">Assistant IA</span>
      <Sparkles className="relative h-3.5 w-3.5 opacity-75" />
    </button>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize theme system (reads localStorage + applies dark class)
  useTheme();

  const [aiOpen, setAiOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFirstVisitPanel, setShowFirstVisitPanel] = useState(false);
  const [authPanelMode, setAuthPanelMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const isAdmin = currentUser?.role === "admin";
  const authenticated = isAuthenticated();

  const currentPage = useMemo(() => getCurrentPageFromPath(location.pathname), [location.pathname]);
  const selectedCourse = (location.state as { course?: Course } | null)?.course ?? null;
  const aiMode = useMemo(() => getAIMode(currentPage), [currentPage]);

  const aiContextCoursId = useMemo(() => {
    if (currentPage === "document-ai") {
      const state = location.state as { id?: number } | null;
      return state?.id ?? undefined;
    }
    return undefined;
  }, [currentPage, location.state]);

  const aiContextCourse = useMemo(() => {
    if (currentPage === "course-detail" && selectedCourse) return selectedCourse.title;
    if (currentPage === "document-ai") {
      const state = location.state as { titre?: string } | null;
      return state?.titre ?? undefined;
    }
    return undefined;
  }, [currentPage, selectedCourse, location.state]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const loadUser = () => {
    if (!isAuthenticated()) { setCurrentUser(null); return; }
    apiGetMe()
      .then(setCurrentUser)
      .catch(() => { clearAuth(); setCurrentUser(null); });
  };

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const panelSeen = localStorage.getItem(FIRST_VISIT_PANEL_KEY) === "1";
    if (!panelSeen && !hasActiveSession()) {
      setAuthPanelMode("login");
      setShowFirstVisitPanel(true);
    }
  }, []);

  const handleLogout = () => { clearAuth(); setCurrentUser(null); navigate("/"); };

  const handleNavigate = (page: string, data?: unknown) => {
    setMobileMenuOpen(false);
    if (page === "ai-chat") { setAiOpen(true); return; }
    const targetPath = pageToPath[page] ?? "/";
    if ((page === "course-detail" || page === "document-ai") && data) {
      navigate(targetPath, { state: page === "course-detail" ? { course: data as Course } : data });
      return;
    }
    navigate(targetPath);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-[#f4f6fb] transition-colors duration-200 dark:bg-slate-950">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top social bar */}
          <div className="relative z-30 bg-[#0f0f1a] px-4 py-1.5 sm:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
              <div className="hidden items-center gap-3 sm:flex">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <button key={i} className="text-white/50 transition-colors hover:text-[#FF6B00]">
                    <Icon className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0f1219]/95">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
              {/* Logo */}
              <button onClick={() => navigate("/")} className="flex flex-shrink-0 items-center gap-2.5">
                <img src="/zentrix.avif" alt="Zentrix" className="h-9 w-9 object-contain" />
                <span className="hidden text-xs font-bold uppercase tracking-[0.22em] text-slate-500 sm:inline dark:text-slate-400">
                  Zentrix Academy
                </span>
              </button>

              {/* Desktop nav */}
              <nav className="hidden items-center gap-0.5 lg:flex">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`group relative px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? "text-[#FF6B00]"
                        : "text-slate-600 hover:text-[#FF6B00] dark:text-slate-300"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#FF6B00] transition-transform duration-300 ${
                      currentPage === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} />
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => handleNavigate("admin")}
                    className={`group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === "admin" ? "text-[#FF6B00]" : "text-slate-600 hover:text-[#FF6B00] dark:text-slate-300"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin</span>
                    <span className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#FF6B00] transition-transform duration-300 ${
                      currentPage === "admin" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`} />
                  </button>
                )}
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {authenticated && currentUser ? (
                  <ProfileDropdown user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
                ) : (
                  <div className="hidden items-center gap-2 md:flex">
                    <button
                      onClick={() => { setAuthPanelMode("login"); setShowFirstVisitPanel(true); }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#FF6B00] dark:text-slate-300"
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => { setAuthPanelMode("register"); setShowFirstVisitPanel(true); }}
                      className="bg-[#FF6B00] px-5 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#e56000]"
                    >
                      S'inscrire
                    </button>
                  </div>
                )}
                <button
                  className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 lg:hidden dark:border-slate-800 dark:text-slate-300"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-[#0f1219]">
                {authenticated && currentUser && (
                  <div className="mb-3 flex items-center gap-3 rounded border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-xs font-bold text-white">
                      {initials(currentUser.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {currentUser.full_name ?? "Utilisateur"}
                      </p>
                      <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  {[...primaryNavItems, ...(isAdmin ? [{ id: "admin", label: "Administration" }] : [])].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`block w-full rounded px-4 py-2.5 text-left text-sm font-medium ${
                        currentPage === item.id
                          ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  {authenticated ? (
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthPanelMode("register");
                        setShowFirstVisitPanel(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 bg-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <User className="h-4 w-4" />
                      S'inscrire / Se connecter
                    </button>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard onNavigate={handleNavigate} />} />
              <Route path="/courses" element={<CoursesPage onNavigate={handleNavigate} />} />
              <Route path="/document-ai" element={<DocumentAIPage />} />
              <Route
                path="/course-detail"
                element={
                  selectedCourse ? (
                    <CourseDetail
                      course={selectedCourse}
                      onBack={() => navigate("/courses")}
                      onOpenAI={() => setAiOpen(true)}
                    />
                  ) : (
                    <Navigate to="/courses" replace />
                  )
                }
              />
              <Route path="/library"       element={<LibraryPage       onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/quizzes"        element={<QuizzesPage        onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/revision"       element={<RevisionPage       onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/notes"          element={<NotesPage />} />
              <Route path="/analytics"      element={<AnalyticsPage />} />
              <Route path="/notifications"  element={<NotificationsPage />} />
              <Route path="/settings"       element={<SettingsPage />} />
              <Route path="/admin"          element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
            <SiteFooter />
          </main>
        </div>

        {/* Floating AI button */}
        <AIFloatingButton onClick={() => setAiOpen(true)} aiOpen={aiOpen} />

        {/* AI panel */}
        <AIPanelChat
          isOpen={aiOpen}
          onClose={() => setAiOpen(false)}
          contextCourse={aiContextCourse}
          contextCoursId={aiContextCoursId}
          contextCourseId={currentPage === "course-detail" && selectedCourse ? (selectedCourse as { backendId?: number }).backendId : undefined}
          mode={aiMode}
        />

        {/* Auth panel */}
        <FirstVisitAuthPanel
          open={showFirstVisitPanel}
          defaultMode={authPanelMode}
          onClose={() => {
            localStorage.setItem(FIRST_VISIT_PANEL_KEY, "1");
            setShowFirstVisitPanel(false);
          }}
          onAuthenticated={() => {
            localStorage.setItem(FIRST_VISIT_PANEL_KEY, "1");
            setShowFirstVisitPanel(false);
            loadUser();
            navigate("/courses");
          }}
        />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
