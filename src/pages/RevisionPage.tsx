import { Brain, Eye, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevisionPage({ onOpenAI }: { onOpenAI: () => void }) {
  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revision Espacee</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Revisez vos cartes et suivez votre rythme d'apprentissage.</p>
        </div>
        <button onClick={onOpenAI} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm text-white">
          <Brain className="h-4 w-4" />
          Generer des cartes
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Skeleton className="mx-auto h-8 w-12" />
            <Skeleton className="mx-auto mt-3 h-4 w-24" />
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm text-white opacity-70">
              <Eye className="h-4 w-4" />
              Voir la reponse
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-4 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm text-red-600">
            <ThumbsDown className="h-4 w-4" />
            Difficile
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-2.5 text-sm text-emerald-600">
            <ThumbsUp className="h-4 w-4" />
            Facile
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Toutes les cartes</h2>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white opacity-70">
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </button>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
