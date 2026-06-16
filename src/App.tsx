import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import SiteFooter from "@/components/layout/SiteFooter";
import CoursesPage from "@/pages/CoursesPage";
import Dashboard from "@/pages/Dashboard";
import AIPanelChat from "@/components/ai/AIPanelChat";
import AboutPage from "@/pages/AboutPage";
import AuthPage from "@/pages/AuthPage";
import DashboardLayout from "@/pages/DashboardLayout";
import { apiGetMe, clearAuth, isAuthenticated, type UserProfile } from "@/lib/api-client";
import {
  BookOpen, ChevronDown, Facebook, GraduationCap, Instagram,
  LayoutDashboard, Linkedin, LogOut, Menu, MessageCircle, Settings, Shield,
  Sparkles, Twitter, X, Youtube,
} from "lucide-react";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ── Public header ─────────────────────────────────────────────────────────────
function PublicHeader({
  currentUser,
  onLogout,
}: {
  currentUser: UserProfile | null;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [profileOpen]);

  const isAuth = isAuthenticated() && !!currentUser;

  const roleLabel: Record<string, string> = {
    admin: "Administrateur", professor: "Professeur", student: "Étudiant",
  };
  const roleColor: Record<string, string> = {
    admin:     "bg-[#FF6B00]/10 text-[#FF6B00]",
    professor: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    student:   "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#0f1219]">
      {/* Social bar */}
      <div className="bg-[#0f0f1a] px-4 py-1.5 sm:px-8">
        <div className="flex items-center justify-end gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            {([Facebook, Twitter, Instagram, Linkedin, Youtube] as const).map((Icon, i) => (
              <button key={i} className="text-white/50 transition-colors hover:text-[#FF6B00]">
                <Icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex flex-shrink-0 items-center gap-2.5">
            <img src="/zentrix.avif" alt="Zentrix" className="h-9 w-9 object-contain" />
            <span className="hidden text-xs font-bold uppercase tracking-[0.22em] text-slate-500 sm:inline dark:text-slate-400">
              Zentrix Academy
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {[
              { label: "Accueil",        path: "/" },
              { label: "Tous les cours", path: "/courses" },
              { label: "À propos",       path: "/about" },
            ].map(({ label, path }) => {
              const active = location.pathname === path || (path === "/courses" && location.pathname.startsWith("/courses"));
              const dest = path === "/courses" && isAuth ? "/dashboard/courses" : path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(dest)}
                  className={`group relative px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-[#FF6B00]" : "text-slate-600 hover:text-[#FF6B00] dark:text-slate-300"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#FF6B00] transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAuth && currentUser ? (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#FF6B00]" />
                  Dashboard
                </button>
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1.5 transition hover:border-[#FF6B00] dark:border-slate-700"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-[11px] font-bold text-white">
                      {initials(currentUser.full_name)}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
                      {currentUser.full_name ?? currentUser.email}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {currentUser.full_name ?? "Utilisateur"}
                        </p>
                        <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                        <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${roleColor[currentUser.role] ?? roleColor.student}`}>
                          {roleLabel[currentUser.role] ?? currentUser.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setProfileOpen(false); navigate("/dashboard"); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                          <LayoutDashboard className="h-4 w-4 text-slate-400" /> Mon Dashboard
                        </button>
                        <button onClick={() => { setProfileOpen(false); navigate("/dashboard/settings"); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                          <Settings className="h-4 w-4 text-slate-400" /> Paramètres
                        </button>
                        {currentUser.role === "admin" && (
                          <button onClick={() => { setProfileOpen(false); navigate("/dashboard/users"); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                            <Shield className="h-4 w-4 text-slate-400" /> Utilisateurs
                          </button>
                        )}
                      </div>
                      <div className="border-t border-slate-100 py-1 dark:border-slate-800">
                        <button onClick={() => { setProfileOpen(false); onLogout(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                          <LogOut className="h-4 w-4" /> Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#FF6B00] dark:text-slate-300">
                  Connexion
                </button>
                <button onClick={() => navigate("/login?mode=register")} className="rounded-lg bg-[#FF6B00] px-5 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#e56000]">
                  S'inscrire
                </button>
              </div>
            )}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden dark:border-slate-800 dark:text-slate-300"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-[#0f1219]">
          {isAuth && currentUser && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-xs font-bold text-white">
                {initials(currentUser.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{currentUser.full_name ?? "Utilisateur"}</p>
                <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <button onClick={() => navigate("/")} className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Accueil</button>
            <button onClick={() => navigate(isAuth ? "/dashboard/courses" : "/courses")} className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Tous les cours</button>
            <button onClick={() => navigate("/about")} className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">À propos</button>
            {isAuth ? (
              <>
                <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-2 rounded-lg bg-[#FF6B00]/10 px-4 py-2.5 text-sm font-semibold text-[#FF6B00]">
                  <LayoutDashboard className="h-4 w-4" /> Mon Dashboard
                </button>
                <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400">
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white">
                <GraduationCap className="h-4 w-4" /> Connexion / Inscription
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ── Shared navigate handler (public) ──────────────────────────────────────────
function usePublicNavigate() {
  const navigate = useNavigate();
  return (page: string, data?: unknown) => {
    if (page === "course-detail") {
      if (!isAuthenticated()) { navigate("/login?redirect=/dashboard/courses"); return; }
      navigate("/dashboard/course-detail", { state: { course: data } });
      return;
    }
    if (page === "courses") { navigate(isAuthenticated() ? "/dashboard/courses" : "/courses"); return; }
    if (!isAuthenticated()) { navigate("/login?redirect=/dashboard"); return; }
    navigate(`/dashboard/${page}`, data ? { state: data } : undefined);
  };
}

// ── Public home (hero + sections) ─────────────────────────────────────────────
function PublicHome({ onOpenAI }: { onOpenAI?: () => void }) {
  const onNavigate = usePublicNavigate();
  return <Dashboard onNavigate={onNavigate} onOpenAI={onOpenAI} />;
}

// ── Public catalogue wrapper ──────────────────────────────────────────────────
function PublicCatalog() {
  const navigate = useNavigate();
  const onNavigate = usePublicNavigate();
  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard/courses", { replace: true });
  }, [navigate]);
  return <CoursesPage onNavigate={onNavigate} />;
}

// ── Public layout ─────────────────────────────────────────────────────────────
function PublicLayout() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  useTheme();

  useEffect(() => {
    if (!isAuthenticated()) { setCurrentUser(null); return; }
    apiGetMe().then(setCurrentUser).catch(() => { clearAuth(); setCurrentUser(null); });
  }, []);

  const handleLogout = () => { clearAuth(); setCurrentUser(null); navigate("/"); };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fb] dark:bg-slate-950">
      <PublicHeader currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PublicHome onOpenAI={() => setAiOpen(true)} />} />
          <Route path="/courses" element={<PublicCatalog />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />

      {/* Floating AI button — visible on all public pages */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          title="Assistant IA Zentrix"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Public AI panel — free for guests, full context for auth users */}
      <AIPanelChat
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        mode="assistant"
      />
    </div>
  );
}

// ── Protected route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
