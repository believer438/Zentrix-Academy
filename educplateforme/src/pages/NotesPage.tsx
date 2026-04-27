import { Plus, Search, StickyNote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHero from "@/components/ui/PageHero";

export default function NotesPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="px-6 py-6">
        <PageHero
          title="Mes Notes"
          subtitle="Organisez et gérez vos notes de cours en un seul endroit"
          backgroundImage="https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=1200&h=400&fit=crop"
          icon={<StickyNote className="h-8 w-8" />}
        />
      </div>

      <div className="flex flex-1 min-w-0">
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mes Notes</h2>
              <button className="rounded-lg bg-[#FF6B00] p-2 text-white">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input disabled placeholder="Rechercher..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900" />
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="flex flex-1 flex-col bg-slate-50 p-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <StickyNote className="h-5 w-5" />
              <span className="text-sm">Contenu de la note</span>
            </div>
            <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton key={item} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
