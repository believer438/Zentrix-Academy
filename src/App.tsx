import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AIPhoneChat, { AIPhoneToggle } from "@/components/ai/AIPhoneChat";
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
import { type Course } from "@/lib/backend-types";
import {
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Phone,
  Search,
  Twitter,
  X,
  Youtube,
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
  "course-detail": "/course-detail",
};

const primaryNavItems = [
  { id: "dashboard", label: "Accueil" },
  { id: "courses", label: "Tous les cours" },
  { id: "document-ai", label: "Document IA" },
  { id: "library", label: "Bibliotheque" },
  { id: "quizzes", label: "Quiz" },
  { id: "notes", label: "Notes" },
];

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
  if (pathname.startsWith("/course-detail")) return "course-detail";
  return "dashboard";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [aiOpen, setAiOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = 0;
  const currentPage = useMemo(
    () => getCurrentPageFromPath(location.pathname),
    [location.pathname]
  );
  const selectedCourse = (location.state as { course?: Course } | null)?.course ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (page: string, data?: unknown) => {
    setMobileMenuOpen(false);

    if (page === "ai-chat") {
      setAiOpen(true);
      return;
    }

    const targetPath = pageToPath[page] ?? "/";
    if (page === "course-detail" && data) {
      navigate(targetPath, { state: { course: data as Course } });
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
          <div className="relative z-30 bg-[#0f0f1a] px-4 py-2 text-[11px] text-white/75 sm:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div className="flex items-center gap-5">
                <a href="mailto:info@zati.africa" className="inline-flex items-center gap-1.5 hover:text-[#FF6B00]">
                  <Mail className="h-3 w-3" />
                  info@zati.africa
                </a>
                <a href="tel:+256414673086" className="hidden items-center gap-1.5 hover:text-[#FF6B00] sm:inline-flex">
                  <Phone className="h-3 w-3" />
                  +256 414 673 086
                </a>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <button key={i} className="text-white/70 transition-colors hover:text-[#FF6B00]">
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0f1219]/95">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
              <button onClick={() => navigate("/")} className="flex items-center gap-3">
                <img src="/zentrix.avif" alt="Zentrix" className="h-10 w-10 object-contain" />
                <span className="hidden text-xs font-bold uppercase tracking-[0.22em] text-slate-500 sm:inline">
                  Zentrix Academy
                </span>
              </button>

              <nav className="hidden items-center gap-1 lg:flex">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === item.id
                        ? "text-[#FF6B00]"
                        : "text-slate-700 hover:text-[#FF6B00] dark:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate("courses")}
                  className="hidden bg-[#FF6B00] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#e56000] md:inline-flex"
                >
                  S'inscrire
                </button>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden dark:border-slate-800 dark:text-slate-300"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-[#0f1219]">
                <div className="space-y-2">
                  {primaryNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className="block w-full rounded-xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAiOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    <Search className="h-4 w-4" />
                    Assistant IA
                  </button>
                </div>
              </div>
            )}
          </header>

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
              <Route path="/library" element={<LibraryPage onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/quizzes" element={<QuizzesPage onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/revision" element={<RevisionPage onOpenAI={() => setAiOpen(true)} />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <div>
          <AIPhoneToggle onClick={() => setAiOpen(true)} isOpen={aiOpen} />
          <AIPhoneChat
            isOpen={aiOpen}
            onClose={() => setAiOpen(false)}
            contextCourse={selectedCourse?.title}
          />
        </div>

        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="fixed bottom-5 right-5 z-40 h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 md:hidden"
          style={{
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
          }}
        >
          {aiOpen ? <X className="h-6 w-6 text-white" /> : <GraduationCap className="h-6 w-6 text-white" />}
        </button>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
