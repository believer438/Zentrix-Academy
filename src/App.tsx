import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/Sidebar";
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
import { Menu, Moon, Sun, X, GraduationCap } from "lucide-react";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = 0;

  // Apply dark mode class to root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Close mobile menu on navigation
  const handleNavigate = (page: string, data?: unknown) => {
    setMobileMenuOpen(false);
    if (page === "course-detail" && data) {
      setSelectedCourse(data as Course);
      setCurrentPage("course-detail");
    } else if (page === "ai-chat") {
      setAiOpen(true);
    } else {
      setCurrentPage(page);
      setSelectedCourse(null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "courses":
        return <CoursesPage onNavigate={handleNavigate} />;
      case "document-ai":
        return <DocumentAIPage />;
      case "course-detail":
        return selectedCourse ? (
          <CourseDetail
            course={selectedCourse}
            onBack={() => setCurrentPage("courses")}
            onOpenAI={() => setAiOpen(true)}
          />
        ) : (
          <CoursesPage onNavigate={handleNavigate} />
        );
      case "library":
        return <LibraryPage onOpenAI={() => setAiOpen(true)} />;
      case "quizzes":
        return <QuizzesPage onOpenAI={() => setAiOpen(true)} />;
      case "revision":
        return <RevisionPage onOpenAI={() => setAiOpen(true)} />;
      case "notes":
        return <NotesPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex h-screen overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200`}>

        {/* ── MOBILE OVERLAY BACKDROP ── */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        {/* Desktop: always visible; Mobile: slide-in overlay */}
        <div className={`
          md:relative md:flex md:flex-shrink-0
          fixed inset-y-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            unreadNotifs={unreadNotifs}
            darkMode={darkMode}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>

        {/* ── MAIN AREA ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Utilisateur</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </header>

          {/* Desktop theme toggle — fixed top right */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:flex fixed top-4 right-4 z-20 items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all text-slate-600 dark:text-slate-300"
            title={darkMode ? "Mode clair" : "Mode sombre"}
          >
            {darkMode
              ? <><Sun className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium">Clair</span></>
              : <><Moon className="w-4 h-4 text-indigo-500" /><span className="text-xs font-medium">Sombre</span></>
            }
          </button>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>

        {/* ── AI PHONE ── */}
        <div>
          <AIPhoneToggle onClick={() => setAiOpen(true)} isOpen={aiOpen} />
          <AIPhoneChat
            isOpen={aiOpen}
            onClose={() => setAiOpen(false)}
            contextCourse={selectedCourse?.title}
          />
        </div>

        {/* ── MOBILE AI BUTTON (simple, bottom right) ── */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="md:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 8px 24px rgba(99,102,241,0.45)" }}
        >
          {aiOpen
            ? <X className="w-6 h-6 text-white" />
            : <GraduationCap className="w-6 h-6 text-white" />
          }
        </button>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
