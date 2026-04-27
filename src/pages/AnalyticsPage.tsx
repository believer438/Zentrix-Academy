import { useMemo } from "react";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";

const MONTHS = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
const HOURS = [12, 18, 22, 28, 34, 41];

const SUBJECTS = [
  { name: "Data Science", value: 38, color: "#FF6B00" },
  { name: "Développement Web", value: 26, color: "#FFB347" },
  { name: "UX/UI Design", value: 18, color: "#3B82F6" },
  { name: "Cybersécurité", value: 12, color: "#10B981" },
  { name: "Autres", value: 6, color: "#94A3B8" },
];

const ACTIVITY = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 7 + 3) % 11;
  if (seed === 0) return 0;
  if (seed <= 3) return 1;
  if (seed <= 7) return 2;
  return 3;
});

const HEAT_COLORS = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-orange-200 dark:bg-orange-900/50",
  "bg-orange-400 dark:bg-orange-700",
  "bg-[#FF6B00] dark:bg-[#FF6B00]",
];

export default function AnalyticsPage() {
  const stats = useMemo(
    () => [
      {
        label: "Heures d'étude",
        value: "155h",
        hint: "+12h ce mois-ci",
        icon: Clock,
        accent: "text-[#FF6B00]",
      },
      {
        label: "Progression moyenne",
        value: "62%",
        hint: "Sur les 4 cours actifs",
        icon: TrendingUp,
        accent: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Quiz terminés",
        value: "23",
        hint: "Score moyen 84%",
        icon: BookOpenCheck,
        accent: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "Série en cours",
        value: "12 jours",
        hint: "Continuez sur votre lancée",
        icon: Flame,
        accent: "text-amber-600 dark:text-amber-400",
      },
    ],
    [],
  );

  const maxHour = Math.max(...HOURS);

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Tableau de bord"
        title="Statistiques d'apprentissage"
        subtitle="Visualisez vos progrès, votre régularité et identifiez les moments où vous êtes le plus efficace."
        backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=600&fit=crop"
        icon={<BarChart3 className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Heures d'étude par mois
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">6 derniers mois</p>
              </div>
              <span className="border-l-2 border-[#FF6B00] bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] dark:bg-orange-950/20">
                +28% vs N-1
              </span>
            </header>
            <div className="flex h-56 items-end gap-3">
              {HOURS.map((value, index) => {
                const heightPct = Math.round((value / maxHour) * 100);
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-full w-full items-end bg-slate-50 dark:bg-slate-900">
                      <div
                        className="w-full bg-gradient-to-t from-[#FF6B00] to-[#FFB347] transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                        {value}h
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {MONTHS[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <header className="mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Répartition par matière
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                % du temps total passé sur chaque sujet
              </p>
            </header>
            <div className="space-y-4">
              {SUBJECTS.map((subject) => (
                <div key={subject.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {subject.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {subject.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full"
                      style={{ width: `${subject.value}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

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
            {ACTIVITY.map((level, i) => (
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
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { icon: Award, label: "Meilleur quiz", value: "98%", hint: "UX Design — Examen final" },
            { icon: Target, label: "Objectif hebdo", value: "5h / 7h", hint: "71% atteint" },
            { icon: Clock, label: "Heure idéale", value: "20h–22h", hint: "Pic de productivité" },
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
