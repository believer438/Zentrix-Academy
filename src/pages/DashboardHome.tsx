import { useEffect, useState } from "react";
import { useSetPageContext } from "@/hooks/usePageContext";
import {
  ArrowRight, BookOpen, Brain, CheckCircle2, ClipboardList,
  FileText, Flame, GraduationCap, Layers, Plus, School, StickyNote,
  TrendingUp, Upload, UserCheck, Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apiGetMe, apiGetMyEnrollments, apiGetNotes,
  apiGetNotifications, apiGetAllProgress, apiGetAnalyticsProfile,
  apiLogActivity, apiGetAdminStats, isAuthenticated,
  type UserProfile, type BackendNote, type BackendNotification,
  type CatalogueProgressResult, type AdminStats,
} from "@/lib/api-client";
import { type CatalogueCourse } from "@/lib/backend-types";

interface Props {
  onNavigate: (page: string, data?: unknown) => void;
  isAdmin?: boolean;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

// ── Admin stats strip ─────────────────────────────────────────────────────────
function AdminStatsStrip({ stats, onNavigate }: { stats: AdminStats; onNavigate: (page: string) => void }) {
  const items = [
    { label: "Utilisateurs",   value: stats.total_users,       sub: `${stats.students} étudiants`,       icon: <Users className="h-4 w-4 text-[#FF6B00]" />,        bg: "bg-[#FF6B00]/10",                      action: () => onNavigate("users") },
    { label: "Cours publiés",  value: stats.published_courses, sub: `${stats.draft_courses} brouillons`,  icon: <BookOpen className="h-4 w-4 text-emerald-500" />,   bg: "bg-emerald-50 dark:bg-emerald-900/20", action: () => onNavigate("courses") },
    { label: "Chapitres",      value: stats.total_chapters,    sub: "dans tous les cours",                icon: <Layers className="h-4 w-4 text-sky-500" />,         bg: "bg-sky-50 dark:bg-sky-900/20",         action: () => onNavigate("courses") },
    { label: "Inscriptions",   value: stats.total_enrollments, sub: "au total",                           icon: <GraduationCap className="h-4 w-4 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20",       action: () => onNavigate("courses") },
    { label: "Quiz passés",    value: (stats as any).total_quizzes ?? 0, sub: `moy. ${(stats as any).avg_quiz_score ?? 0}%`, icon: <Brain className="h-4 w-4 text-violet-500" />, bg: "bg-violet-50 dark:bg-violet-900/20", action: () => onNavigate("quiz-stats") },
    { label: "Professeurs",    value: stats.professors,        sub: `${stats.admins} admins`,             icon: <School className="h-4 w-4 text-purple-500" />,      bg: "bg-purple-50 dark:bg-purple-900/20",   action: () => onNavigate("users") },
  ];

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">Vue d'ensemble — Administration</span>
          <div className="h-px flex-1 bg-[#FF6B00]/20" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {items.map(item => (
            <button key={item.label} onClick={item.action}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-left transition hover:border-[#FF6B00]/30 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
                <p className="truncate text-[10px] text-slate-400">{item.label}</p>
                <p className="truncate text-[10px] text-slate-300 dark:text-slate-600">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin quick actions panel ─────────────────────────────────────────────────
function AdminQuickActions({ onNavigate }: { onNavigate: (page: string) => void }) {
  const actions = [
    { label: "Créer un cours",     icon: Plus,          color: "bg-[#FF6B00]",       action: () => onNavigate("create-course"), desc: "Wizard multi-étapes" },
    { label: "Gérer les cours",    icon: BookOpen,      color: "bg-emerald-600",      action: () => onNavigate("courses"),       desc: "Modifier, publier" },
    { label: "Utilisateurs",       icon: Users,         color: "bg-blue-600",         action: () => onNavigate("users"),         desc: "Rôles & comptes" },
    { label: "Stats Quiz",         icon: ClipboardList, color: "bg-violet-600",       action: () => onNavigate("quiz-stats"),    desc: "Résultats & scores" },
    { label: "Analytiques",        icon: TrendingUp,    color: "bg-teal-600",         action: () => onNavigate("analytics"),     desc: "Activité globale" },
    { label: "Document IA",        icon: Upload,        color: "bg-indigo-600",       action: () => onNavigate("document-ai"),   desc: "Analyse de fichiers" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="h-4 w-4 text-[#FF6B00]" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Actions admin</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 @sm:grid-cols-3">
        {actions.map(({ label, icon: Icon, color, action, desc }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left transition hover:border-[#FF6B00]/30 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{label}</p>
              <p className="truncate text-[10px] text-slate-400">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardHome({ onNavigate, isAdmin = false }: Props) {
  const [user, setUser]                   = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments]     = useState<CatalogueCourse[]>([]);
  const [progress, setProgress]           = useState<CatalogueProgressResult[]>([]);
  const [notes, setNotes]                 = useState<BackendNote[]>([]);
  const [notifs, setNotifs]               = useState<BackendNotification[]>([]);
  const [activeDays, setActiveDays]       = useState(0);
  const [loading, setLoading]             = useState(true);
  const [adminStats, setAdminStats]       = useState<AdminStats | null>(null);

  useEffect(() => {
    Promise.allSettled([
      apiGetMe(),
      apiGetMyEnrollments(),
      apiGetAllProgress(),
      apiGetNotes(),
      apiGetNotifications(),
      apiGetAnalyticsProfile(),
    ]).then(([u, enr, prog, n, notif, analytics]) => {
      if (u.status === "fulfilled")         setUser(u.value);
      if (enr.status === "fulfilled")       setEnrollments(enr.value);
      if (prog.status === "fulfilled")      setProgress(prog.value);
      if (n.status === "fulfilled")         setNotes(n.value);
      if (notif.status === "fulfilled")     setNotifs(notif.value);
      if (analytics.status === "fulfilled") setActiveDays(analytics.value.activity_summary?.active_days ?? 0);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    apiGetAdminStats().then(setAdminStats).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const interval = setInterval(() => {
      apiLogActivity({ event_type: "PAGE_TIME", metadata: { page: "dashboard", seconds: 60 } });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const progressMap     = Object.fromEntries(progress.map(p => [p.course_id, p.percent_complete]));
  const unreadNotifs    = notifs.filter(n => !n.is_read).length;
  const avgProgress     = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, c) => acc + (progressMap[c.id] ?? 0), 0) / enrollments.length)
    : 0;
  const completedCourses  = enrollments.filter(c => (progressMap[c.id] ?? 0) >= 100).length;
  const inProgressCourses = enrollments.filter(c => { const p = progressMap[c.id] ?? 0; return p > 0 && p < 100; });

  useSetPageContext({
    current_page: "dashboard",
    page_title:   "Tableau de bord",
    page_data: {
      enrolled_courses_count:  enrollments.length,
      avg_progress:            avgProgress,
      completed_courses:       completedCourses,
      in_progress_courses:     inProgressCourses.length,
      unread_notifications:    unreadNotifs,
      active_days:             activeDays,
      recent_courses:          inProgressCourses.slice(0, 3).map(c => ({
        id:       c.id,
        title:    c.title,
        progress: progressMap[c.id] ?? 0,
      })),
    },
  });

  const statCards = [
    { label: "Cours inscrits",       value: String(enrollments.length), icon: BookOpen,   color: "text-[#FF6B00]",   bg: "bg-[#FF6B00]/10",                      onClick: () => onNavigate("courses") },
    { label: "Progression moyenne",  value: `${avgProgress}%`,          icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", onClick: () => onNavigate("analytics") },
    { label: "Cours terminés",       value: String(completedCourses),    icon: CheckCircle2, color: "text-teal-500",  bg: "bg-teal-50 dark:bg-teal-900/20",       onClick: () => onNavigate("analytics") },
    { label: "Jours actifs",         value: String(activeDays),          icon: Flame,      color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-900/20",       onClick: () => onNavigate("analytics") },
  ];

  const quickActions = [
    { label: "Reprendre un cours", icon: BookOpen,  action: () => onNavigate("courses"),     color: "bg-[#FF6B00]" },
    { label: "Document IA",        icon: Upload,    action: () => onNavigate("document-ai"), color: "bg-indigo-600" },
    { label: "Faire un quiz",      icon: Brain,     action: () => onNavigate("quizzes"),     color: "bg-violet-600" },
    { label: "Écrire une note",    icon: FileText,  action: () => onNavigate("notes"),       color: "bg-teal-600" },
  ];

  return (
    <div className="min-h-full bg-[#f4f6fb] dark:bg-slate-950">

      {/* ── Welcome banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f0f1a] via-[#1a1130] to-[#0f1523] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,107,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#FF6B00] via-[#FF6B00]/50 to-transparent" />
        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FF6B00]">
              {greeting()},
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {loading
                ? <Skeleton className="mt-1 h-8 w-40 bg-white/10" />
                : <>{user?.full_name?.split(" ")[0] ?? "Apprenant"} 👋</>}
            </h1>
            <div className="mt-2 text-sm text-slate-400">
              {loading
                ? <Skeleton className="h-4 w-72 bg-white/10" />
                : isAdmin
                ? "Vous êtes connecté en tant qu'administrateur. Bonne gestion !"
                : inProgressCourses.length > 0
                  ? `Vous avez ${inProgressCourses.length} cours en cours. Continuez sur votre lancée !`
                  : enrollments.length > 0
                  ? "Tous vos cours sont à jour. Explorez de nouveaux parcours !"
                  : "Commencez dès aujourd'hui — explorez le catalogue et inscrivez-vous à un cours."}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:pb-1">
            {!loading && unreadNotifs > 0 && (
              <button
                onClick={() => onNavigate("notifications")}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <span className="h-2 w-2 rounded-full bg-[#FF6B00]" />
                {unreadNotifs} nouvelle{unreadNotifs > 1 ? "s" : ""}
              </button>
            )}
            <button
              onClick={() => onNavigate("courses")}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e56000]"
            >
              {isAdmin ? "Gérer les cours" : "Explorer les cours"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Admin stats strip (admin only) ──────────────────────────────────── */}
      {isAdmin && adminStats && (
        <AdminStatsStrip stats={adminStats} onNavigate={onNavigate} />
      )}

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8">

        {/* ── Admin quick actions (admin only) ────────────────────────────────── */}
        {isAdmin && (
          <AdminQuickActions onNavigate={onNavigate} />
        )}

        {/* ── Stat cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 @lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                {loading
                  ? <Skeleton className="mb-1.5 h-7 w-12" />
                  : <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>}
                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-6 @lg:grid-cols-[1fr_340px]">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Cours inscrits */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mes cours</h2>
                </div>
                <button
                  onClick={() => onNavigate("courses")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:underline"
                >
                  Voir tout <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {loading ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-4 px-6 py-4">
                      <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <BookOpen className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isAdmin ? "Aucun cours inscrit (mode admin)" : "Aucun cours inscrit"}
                  </p>
                  <button
                    onClick={() => onNavigate("courses")}
                    className="rounded-lg bg-[#FF6B00] px-5 py-2 text-xs font-bold text-white hover:bg-[#e56000]"
                  >
                    {isAdmin ? "Gérer les cours" : "Parcourir le catalogue"}
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrollments.slice(0, 5).map(course => {
                    const pct = progressMap[course.id] ?? 0;
                    return (
                      <li key={course.id}>
                        <button
                          onClick={() => onNavigate("course-detail", course)}
                          className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#FFB347] to-[#FF6B00]">
                            {course.cover_image
                              ? <img src={course.cover_image} alt={course.title} className="h-full w-full object-cover" />
                              : <BookOpen className="h-5 w-5 text-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{course.title}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{course.category ?? "Général"}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <div className="h-full rounded-full bg-[#FF6B00] transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                            </div>
                          </div>
                          {pct >= 100 && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Actions rapides</h2>
              <div className="grid grid-cols-2 gap-3 @sm:grid-cols-4">
                {quickActions.map(({ label, icon: Icon, action, color }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Progression globale */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Progression globale</h2>
              </div>
              <div className="mt-4 flex items-end justify-between">
                {loading
                  ? <Skeleton className="h-12 w-20" />
                  : <span className="text-5xl font-black text-slate-900 dark:text-white">{avgProgress}%</span>}
                {loading
                  ? <Skeleton className="mb-1 h-3 w-24" />
                  : <span className="mb-1 text-xs text-slate-400">sur {enrollments.length} cours</span>}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                {loading
                  ? <Skeleton className="h-full w-full rounded-full" />
                  : <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FFB347] to-[#FF6B00] transition-all duration-700"
                      style={{ width: `${avgProgress}%` }}
                    />}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
                  {loading
                    ? <Skeleton className="mx-auto mb-1 h-7 w-8" />
                    : <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedCourses}</p>}
                  <p className="mt-0.5 text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Terminés</p>
                </div>
                <div className="rounded-xl bg-[#FF6B00]/10 p-3 text-center">
                  {loading
                    ? <Skeleton className="mx-auto mb-1 h-7 w-8" />
                    : <p className="text-xl font-black text-[#FF6B00]">{inProgressCourses.length}</p>}
                  <p className="mt-0.5 text-[10px] text-[#FF6B00]/70">En cours</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("analytics")}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-400"
              >
                Voir les statistiques
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Notes récentes */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <StickyNote className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notes récentes</h2>
                </div>
                <button
                  onClick={() => onNavigate("notes")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:underline"
                >
                  Voir tout <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {loading ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="px-5 py-3.5 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2.5 w-16" />
                    </li>
                  ))}
                </ul>
              ) : notes.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400">Aucune note pour l'instant</p>
                  <button onClick={() => onNavigate("notes")} className="mt-2 text-xs font-semibold text-blue-500 hover:underline">
                    Créer une note
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notes.slice(0, 3).map(note => (
                    <li key={note.id}>
                      <button
                        onClick={() => onNavigate("notes")}
                        className="w-full px-5 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{note.titre}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                          {note.contenu?.replace(/<[^>]*>/g, "").slice(0, 80) || "—"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">
                          {relativeTime(note.created_at)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Jours actifs */}
            <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 p-5 dark:border-rose-900/30 dark:from-rose-950/40 dark:to-orange-950/30">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-500">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                {loading
                  ? <Skeleton className="mb-1 h-7 w-20 bg-rose-200/50 dark:bg-rose-800/30" />
                  : <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{activeDays} jours</p>}
                <p className="text-xs text-rose-500/80 dark:text-rose-400/70">d'activité sur la plateforme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
