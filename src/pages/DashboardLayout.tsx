import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3, Bell, BookOpen, Bot, ChevronLeft, ChevronRight,
  ClipboardList, GraduationCap, HelpCircle, LayoutDashboard, Library,
  LogOut, Menu, Plus, Settings, StickyNote, Sparkles, Upload, Users, X,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialog, CONFIRM_CLOSED, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import AIPanelChat, { type AIMode } from "@/components/ai/AIPanelChat";
import DashboardHome from "@/pages/DashboardHome";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetail from "@/pages/CourseDetail";
import DocumentAIPage from "@/pages/DocumentAIPage";
import LibraryPage from "@/pages/LibraryPage";
import QuizzesPage from "@/pages/QuizzesPage";
import NotesPage from "@/pages/NotesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminQuizStatsPage from "@/pages/AdminQuizStatsPage";
import CourseWizardPage from "@/pages/CourseWizardPage";

import { type Course } from "@/lib/backend-types";
import { apiGetMe, clearAuth, isAuthenticated, type UserProfile } from "@/lib/api-client";
import { useTheme } from "@/hooks/useTheme";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const navItems = [
  { id: "",               label: "Tableau de bord", icon: LayoutDashboard },
  { id: "courses",        label: "Tous les cours",  icon: BookOpen },
  { id: "document-ai",   label: "Document IA",     icon: Upload },
  { id: "library",        label: "Bibliothèque",    icon: Library },
  { id: "quizzes",        label: "Quiz & Examens",  icon: HelpCircle },
  { id: "notes",          label: "Mes Notes",       icon: StickyNote },
  { id: "analytics",      label: "Statistiques",    icon: BarChart3 },
];

const bottomItems = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings",      label: "Paramètres",    icon: Settings },
];

const adminItems = [
  { id: "create-course", label: "Nouveau cours",  icon: Plus },
  { id: "users",         label: "Utilisateurs",   icon: Users },
  { id: "quiz-stats",    label: "Stats Quiz",      icon: ClipboardList },
];

function pageTitle(segment: string): string {
  const map: Record<string, string> = {
    "":               "Tableau de bord",
    "courses":        "Tous les cours",
    "course-detail":  "Détail du cours",
    "document-ai":    "Document IA",
    "library":        "Bibliothèque",
    "quizzes":        "Quiz & Examens",
    "notes":          "Mes Notes",
    "analytics":      "Statistiques",
    "notifications":  "Notifications",
    "settings":       "Paramètres",
    "users":          "Utilisateurs",
    "quiz-stats":     "Résultats Quiz",
    "create-course":  "Créer un cours",
    "edit-course":    "Modifier le cours",
  };
  return map[segment] ?? "Dashboard";
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [aiWidth, setAiWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef      = useRef(false);
  const resizeStartX     = useRef(0);
  const resizeStartWidth = useRef(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const segment = useMemo(() => {
    const parts = location.pathname.replace("/dashboard", "").replace(/^\//, "");
    return parts.split("/")[0];
  }, [location.pathname]);

  const selectedCourse = useMemo(
    () => (location.state as { course?: Course } | null)?.course ?? null,
    [location.state],
  );

  const aiMode: AIMode = useMemo(() => {
    if (segment === "document-ai") return "document";
    if (segment === "course-detail") return "course";
    return "assistant";
  }, [segment]);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login", { replace: true }); return; }
    apiGetMe().then(setCurrentUser).catch(() => { clearAuth(); navigate("/login", { replace: true }); });
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Collapse the sidebar automatically when the user opens a course
  useEffect(() => {
    if (segment === "course-detail") setCollapsed(true);
  }, [segment]);

  useEffect(() => {
    if (!profileOpen) return;
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [profileOpen]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = resizeStartX.current - e.clientX;
      setAiWidth(Math.max(240, Math.min(700, resizeStartWidth.current + delta)));
    };
    const onUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    resizingRef.current      = true;
    resizeStartX.current     = e.clientX;
    resizeStartWidth.current = aiWidth;
    setIsResizing(true);
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  }, [aiWidth]);

  const handleNavigate = useCallback((page: string, data?: unknown) => {
    setMobileOpen(false);
    if (page === "ai-chat") { setAiOpen(true); return; }
    const routes: Record<string, string> = {
      dashboard:        "/dashboard",
      courses:          "/dashboard/courses",
      "course-detail":  "/dashboard/course-detail",
      "document-ai":    "/dashboard/document-ai",
      library:          "/dashboard/library",
      quizzes:          "/dashboard/quizzes",
      revision:         "/dashboard/quizzes",
      notes:            "/dashboard/notes",
      analytics:        "/dashboard/analytics",
      notifications:    "/dashboard/notifications",
      settings:         "/dashboard/settings",
      users:            "/dashboard/users",
      "quiz-stats":     "/dashboard/quiz-stats",
      "create-course":  "/dashboard/create-course",
      "edit-course":    "/dashboard/edit-course",
    };
    const path = routes[page] ?? "/dashboard";
    if (data) {
      if (page === "course-detail") navigate(path, { state: { course: data as Course } });
      else if (page === "edit-course") navigate(path, { state: { editCourse: data } });
      else navigate(path, { state: data });
    } else {
      navigate(path);
    }
  }, [navigate]);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const handleLogout = () => { clearAuth(); setCurrentUser(null); navigate("/", { replace: true }); };
  const openLogoutConfirm = () => setLogoutConfirmOpen(true);

  const isActive = (id: string) => segment === id;
  const isAdmin = currentUser?.role === "admin";

  const roleLabel: Record<string, string> = {
    admin: "Administrateur", professor: "Professeur", student: "Étudiant",
  };
  const roleColor: Record<string, string> = {
    admin:     "bg-[#FF6B00]/10 text-[#FF6B00]",
    professor: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    student:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  };

  function NavButton({ id, label, Icon, mobile = false }: { id: string; label: string; Icon: React.ElementType; mobile?: boolean }) {
    const active = isActive(id);
    return (
      <button
        key={id}
        onClick={() => handleNavigate(id || "dashboard")}
        title={collapsed && !mobile ? label : undefined}
        className={`group flex w-full items-center rounded-lg transition-all ${
          collapsed && !mobile ? "justify-center p-3" : "gap-3 px-3 py-2.5"
        } ${
          active
            ? "bg-[#FF6B00]/10 text-[#FF6B00]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        }`}
      >
        <Icon style={{ width: 18, height: 18 }} className={`flex-shrink-0 ${active ? "text-[#FF6B00]" : ""}`} />
        {(!collapsed || mobile) && (
          <span className={`text-sm font-medium ${active ? "font-semibold" : ""}`}>{label}</span>
        )}
        {active && (!collapsed || mobile) && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
        )}
      </button>
    );
  }

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <div className={`flex h-full flex-col bg-white dark:bg-slate-900 ${mobile ? "" : "border-r border-slate-200 dark:border-slate-800"}`}>
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-100 dark:border-slate-800 ${collapsed && !mobile ? "justify-center px-3 py-4" : "gap-3 px-5 py-4"}`}>
          <img src="/zentrix.avif" alt="Zentrix" className="h-9 w-9 flex-shrink-0 object-contain" />
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">Zentrix</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Academy</p>
            </div>
          )}
          {mobile && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} mobile={mobile} />
          ))}
        </nav>

        {/* Bottom items */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-2 py-2 space-y-0.5">
          {bottomItems.map(({ id, label, icon: Icon }) => {
            const active = isActive(id);
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                title={collapsed && !mobile ? label : undefined}
                className={`group flex w-full items-center rounded-lg transition-all ${
                  collapsed && !mobile ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <Icon style={{ width: 18, height: 18 }} className="flex-shrink-0" />
                {(!collapsed || mobile) && <span className="text-sm font-medium">{label}</span>}
              </button>
            );
          })}

          {/* Admin items — no header, juste séparés par un thin divider */}
          {isAdmin && (
            <>
              <div className="mx-2 my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
              {adminItems.map(({ id, label, icon: Icon }) => (
                <NavButton key={id} id={id} label={label} Icon={Icon} mobile={mobile} />
              ))}
            </>
          )}
        </div>

        {/* User info */}
        {currentUser && (
          <div className={`border-t border-slate-100 dark:border-slate-800 p-3 ${collapsed && !mobile ? "flex justify-center" : ""}`}>
            {collapsed && !mobile ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-[11px] font-bold text-white">
                {initials(currentUser.full_name)}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-[11px] font-bold text-white">
                  {initials(currentUser.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {currentUser.full_name ?? currentUser.email.split("@")[0]}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${roleColor[currentUser.role] ?? roleColor.student}`}>
                    {roleLabel[currentUser.role] ?? currentUser.role}
                  </span>
                </div>
                <button onClick={openLogoutConfirm} title="Déconnexion" className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderPage() {
    switch (segment) {
      case "":              return <DashboardHome onNavigate={handleNavigate} isAdmin={isAdmin} />;
      case "courses":       return <CoursesPage onNavigate={handleNavigate} isAdmin={isAdmin} />;
      case "course-detail":
        return selectedCourse
          ? <CourseDetail course={selectedCourse} onBack={() => handleNavigate("courses")} onOpenAI={() => setAiOpen(true)} />
          : <CoursesPage onNavigate={handleNavigate} isAdmin={isAdmin} />;
      case "document-ai":   return <DocumentAIPage />;
      case "library":       return <LibraryPage onOpenAI={() => setAiOpen(true)} />;
      case "quizzes":       return <QuizzesPage onOpenAI={() => setAiOpen(true)} />;
      case "notes":         return <NotesPage />;
      case "analytics":     return <AnalyticsPage />;
      case "notifications": return <NotificationsPage onNavigate={handleNavigate} />;
      case "settings":      return <SettingsPage />;
      case "users":         return isAdmin ? <AdminUsersPage /> : <DashboardHome onNavigate={handleNavigate} isAdmin={false} />;
      case "quiz-stats":    return isAdmin ? <AdminQuizStatsPage /> : <DashboardHome onNavigate={handleNavigate} isAdmin={false} />;
      case "create-course": return isAdmin ? <CourseWizardPage onNavigate={handleNavigate} /> : <DashboardHome onNavigate={handleNavigate} isAdmin={false} />;
      case "edit-course":   return isAdmin ? <CourseWizardPage onNavigate={handleNavigate} /> : <DashboardHome onNavigate={handleNavigate} isAdmin={false} />;
      default:              return <DashboardHome onNavigate={handleNavigate} isAdmin={isAdmin} />;
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-[#f4f6fb] dark:bg-slate-950 transition-colors duration-200">

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent mobile />
        </div>

        {/* Desktop sidebar — masqué complètement en mode cours */}
        <div className={`relative hidden flex-shrink-0 transition-all duration-300 lg:flex overflow-hidden ${segment === "course-detail" ? "w-0" : collapsed ? "w-[68px]" : "w-[240px]"}`}>
          <div className="absolute inset-0">
            <SidebarContent />
          </div>
        </div>

        {/* Sidebar collapse toggle — fixed so it's always visible and overlaid */}
        {segment !== "course-detail" && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`fixed top-[72px] z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-[left] duration-300 hover:text-slate-600 lg:flex dark:border-slate-700 dark:bg-slate-800 dark:hover:text-slate-300 ${
              collapsed ? "left-[56px]" : "left-[228px]"
            }`}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#0f1219]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 lg:hidden dark:border-slate-700 dark:text-slate-400"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <GraduationCap className="h-4 w-4 text-[#FF6B00]" />
                <span>/</span>
                <span className="font-semibold text-slate-900 dark:text-white">{pageTitle(segment)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate("notifications")}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <Bell className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              </button>

              {currentUser && (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 transition hover:border-[#FF6B00]/50 dark:border-slate-700"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-[11px] font-bold text-white">
                      {initials(currentUser.full_name)}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
                      {currentUser.full_name ?? currentUser.email.split("@")[0]}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {currentUser.full_name ?? "Utilisateur"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                        <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${roleColor[currentUser.role] ?? roleColor.student}`}>
                          {roleLabel[currentUser.role] ?? currentUser.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { setProfileOpen(false); handleNavigate("settings"); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          Paramètres
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { setProfileOpen(false); handleNavigate("users"); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Users className="h-4 w-4 text-slate-400" />
                            Gestion utilisateurs
                          </button>
                        )}
                      </div>
                      <div className="border-t border-slate-100 py-1 dark:border-slate-800">
                        <button
                          onClick={() => { setProfileOpen(false); openLogoutConfirm(); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto @container">
            {renderPage()}
          </main>
        </div>

        {/* AI Push Panel — desktop only (sm+) */}
        {!isMobile && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: aiOpen ? aiWidth + 12 : 0,
              transition: isResizing ? "none" : "width 0.32s cubic-bezier(0.4,0,0.2,1)",
              willChange: "width",
            }}
          >
            <div className="flex h-full">
              <div className="relative w-3 flex-shrink-0 border-l border-r border-slate-200 bg-[#f4f6fb] dark:border-slate-700 dark:bg-slate-950">
                <div className="absolute inset-x-0 top-0 h-10 rounded-br-2xl bg-white dark:bg-[#0f1219]" />
                <div
                  onMouseDown={onResizeStart}
                  className="group absolute inset-0 z-10 cursor-col-resize"
                  title="Glisser pour redimensionner"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                  </div>
                  {isResizing && (
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#FF6B00]/60" />
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden rounded-tl-2xl border-l border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f1219]">
                <AIPanelChat
                  push
                  isOpen={aiOpen}
                  onClose={() => setAiOpen(false)}
                  contextCourse={segment === "course-detail" && selectedCourse ? selectedCourse.title : undefined}
                  contextCoursId={undefined}
                  contextCourseId={segment === "course-detail" && selectedCourse ? (selectedCourse as { backendId?: number }).backendId : undefined}
                  mode={aiMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Overlay — mobile fullscreen */}
        {isMobile && aiOpen && (
          <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white dark:bg-[#0f1219]">
            <AIPanelChat
              push
              isOpen={aiOpen}
              onClose={() => setAiOpen(false)}
              contextCourse={segment === "course-detail" && selectedCourse ? selectedCourse.title : undefined}
              contextCoursId={undefined}
              contextCourseId={segment === "course-detail" && selectedCourse ? (selectedCourse as { backendId?: number }).backendId : undefined}
              mode={aiMode}
            />
          </div>
        )}

        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 overflow-hidden bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-3 text-white shadow-lg shadow-[#FF6B00]/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            style={{ borderRadius: "2rem" }}
          >
            <span className="absolute inset-0 animate-ping rounded-[2rem] bg-[#FF6B00] opacity-20" style={{ animationDuration: "2.5s" }} />
            <Bot className="relative h-5 w-5" />
            <span className="relative text-sm font-bold">Assistant IA</span>
            <Sparkles className="relative h-3.5 w-3.5 opacity-75" />
          </button>
        )}
      </div>
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Se déconnecter ?"
        description="Vous allez quitter votre session Zentrix Academy. Vous devrez vous reconnecter pour accéder à votre espace."
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={() => { setLogoutConfirmOpen(false); handleLogout(); }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
      <Toaster />
      <SonnerToaster richColors position="top-right" />
    </TooltipProvider>
  );
}
