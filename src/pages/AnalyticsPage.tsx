import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const stats = useMemo(
    () => [
      { label: "Heures d'etude", value: "--", hint: "Aucune donnee pour le moment" },
      { label: "Progression moyenne", value: "--", hint: "Aucun cours synchronise" },
      { label: "Quiz termines", value: "--", hint: "Aucune tentative recue" },
      { label: "Cours actifs", value: "--", hint: "Aucune inscription chargee" },
    ],
    []
  );

  const monthBars = [0, 0, 0, 0, 0, 0];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-slate-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statistiques</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Suivez ici vos statistiques et votre progression.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{stat.label}</p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Heures par mois</h2>
          </div>
          <div className="flex h-56 items-end gap-3">
            {monthBars.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <div
                    className="w-full rounded-2xl bg-slate-200 transition-all dark:bg-slate-800"
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{["Oct", "Nov", "Dec", "Jan", "Fev", "Mar"][index]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">
            Les barres s'animeront automatiquement quand les donnees d'activite seront disponibles.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">Repartition par matiere</h2>
          <div className="space-y-4">
            {["Reseaux", "Programmation", "Mathematiques", "Autres"].map((subject) => (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{subject}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Aucune donnee</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800" style={{ width: "12%" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
