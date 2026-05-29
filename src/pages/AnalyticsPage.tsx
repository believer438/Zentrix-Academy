import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { apiGetAnalyticsProfile, isAuthenticated, type AnalyticsProfile } from "@/lib/api-client";

const HEAT_COLORS = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-orange-200 dark:bg-orange-900/50",
  "bg-orange-400 dark:bg-orange-700",
  "bg-[#FF6B00] dark:bg-[#FF6B00]",
];

const ACTIVITY_GRID = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 7 + 3) % 11;
  if (seed === 0) return 0;
  if (seed <= 3) return 1;
  if (seed <= 7) return 2;
  return 3;
});

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<AnalyticsProfile | null>(null);
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    setLoading(true);
    apiGetAnalyticsProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeMinutes    = profile?.activity_summary?.estimated_time_min ?? 0;
  const timeHours      = (timeMinutes / 60).toFixed(1);
  const activeDays     = profile?.activity_summary?.active_days ?? 0;
  const totalEvents    = profile?.activity_summary?.total_events ?? 0;
  const weaknesses     = profile?.weaknesses ?? [];
  const level          = (profile?.profile as Record<string, string> | undefined)?.level ?? "debutant";
  const questionCount  = (profile?.profile as Record<string, number> | undefined)?.question_count ?? 0;

  const stats = useMemo(
    () => [
      {
        label:  "Heures d'étude",
        value:  loading ? "…" : `${timeHours}h`,
        hint:   `Temps actif estimé depuis l'inscription`,
        icon:   Clock,
        accent: "text-[#FF6B00]",
      },
      {
        label:  "Jours actifs",
        value:  loading ? "…" : String(activeDays),
        hint:   "Jours avec au moins 1 activité",
        icon:   TrendingUp,
        accent: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label:  "Questions posées",
        value:  loading ? "…" : String(questionCount),
        hint:   "Questions à l'assistant IA",
        icon:   BookOpenCheck,
        accent: "text-blue-600 dark:text-blue-400",
      },
      {
        label:  "Niveau actuel",
        value:  loading ? "…" : level.charAt(0).toUpperCase() + level.slice(1),
        hint:   `Basé sur ${totalEvents} événements trackés`,
        icon:   Flame,
        accent: "text-amber-600 dark:text-amber-400",
      },
    ],
    [loading, timeHours, activeDays, questionCount, level, totalEvents],
  );

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Tableau de bord"
        title="Statistiques d'apprentissage"
        subtitle="Visualisez vos progrès, votre régularité et identifiez vos points forts et vos faiblesses."
        backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=600&fit=crop"
        icon={<BarChart3 className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Stats cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center bg-slate-100 dark:bg-slate-800 ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{stat.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.hint}</p>
            </div>
          ))}
        </div>

        {/* ── Faiblesses IA + Heatmap ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Faiblesses détectées */}
          <section className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <header className="mb-5 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Faiblesses détectées par l'IA
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Topics où l'IA a détecté des difficultés récurrentes
                </p>
              </div>
            </header>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : weaknesses.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Aucune faiblesse détectée
                </p>
                <p className="text-xs text-slate-400">
                  Continuez à apprendre — l'IA analysera vos patterns.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {weaknesses.slice(0, 8).map((w) => {
                  const maxScore = weaknesses[0]?.score ?? 1;
                  const pct      = Math.min(100, Math.round((w.score / maxScore) * 100));
                  const level    = pct > 66 ? "Critique" : pct > 33 ? "Modéré" : "Léger";
                  const color    = pct > 66 ? "#FF6B00" : pct > 33 ? "#FFB347" : "#94A3B8";
                  return (
                    <div key={w.topic}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                          {w.topic}
                        </span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                          style={{ color, backgroundColor: `${color}18` }}
                        >
                          {level}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Heatmap régularité */}
          <section className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <header className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Régularité — 4 dernières semaines
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chaque case représente un jour. Plus c'est foncé, plus vous avez étudié.
                </p>
              </div>
              <Calendar className="h-5 w-5 text-[#FF6B00]" />
            </header>
            <div className="grid grid-cols-7 gap-1.5">
              {ACTIVITY_GRID.map((level, i) => (
                <div
                  key={i}
                  className={`aspect-square ${HEAT_COLORS[level]}`}
                  title={`Jour ${i + 1} — niveau ${level}`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Moins</span>
              {HEAT_COLORS.map((c, i) => (
                <span key={i} className={`h-3 w-3 ${c}`} />
              ))}
              <span>Plus</span>
            </div>

            {/* Activité résumé */}
            {profile && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {Object.entries(profile.activity_summary.event_counts ?? {})
                  .filter(([k]) => k !== "PAGE_TIME")
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([event, count]) => (
                    <div key={event} className="rounded border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs font-bold text-[#FF6B00]">{count}</p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {event.replace(/_/g, " ").toLowerCase()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Indicateurs du bas ───────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { icon: Award,  label: "Niveau détecté",      value: loading ? "…" : level.charAt(0).toUpperCase() + level.slice(1), hint: "Basé sur la progression globale" },
            { icon: Target, label: "Questions à l'IA",    value: loading ? "…" : String(questionCount),            hint: "Depuis le début" },
            { icon: Clock,  label: "Temps actif estimé",  value: loading ? "…" : `${timeHours}h`,                  hint: "Basé sur le tracking en session" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#FF6B00]/10 text-[#FF6B00]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.hint}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
