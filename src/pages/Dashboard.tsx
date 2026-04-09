import { ArrowRight, BarChart3, BookOpen, Brain, Clock, Flame, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: "Cours inscrits", value: "12", detail: "3 nouveaux cette semaine", icon: BookOpen },
    { label: "Heures d'etude", value: "48 h", detail: "Moyenne stable", icon: Clock },
    { label: "Serie active", value: "8 jours", detail: "Bonne regularite", icon: Flame },
  ];

  const learningItems = [
    { title: "Architecture frontend", meta: "Module 4 sur 8", progress: 68 },
    { title: "Base de donnees SQL", meta: "Quiz de revision pret", progress: 42 },
    { title: "Analyse de donnees", meta: "Chapitre 2 en cours", progress: 31 },
  ];

  const weeklyActivity = [
    { day: "L", value: 42 },
    { day: "M", value: 64 },
    { day: "M", value: 58 },
    { day: "J", value: 76 },
    { day: "V", value: 61 },
    { day: "S", value: 88 },
    { day: "D", value: 47 },
  ];

  const focusItems = [
    "Reprendre un cours incomplet",
    "Passer un quiz de revision",
    "Demander une explication a l'IA",
  ];

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-8 sm:py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Vue generale</p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Tableau de bord</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Suivez l'essentiel de votre apprentissage, reprenez rapidement vos cours et gardez une vue claire de votre activite.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.24)]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Assistant</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Disponible pour vous aider</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Continuer l'apprentissage</h2>
              <button onClick={() => onNavigate("courses")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {learningItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.progress}%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activite</h2>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex h-40 items-end gap-2">
              {weeklyActivity.map((item) => (
                <div key={`${item.day}-${item.value}`} className="flex flex-1 flex-col items-center justify-end gap-2">
     