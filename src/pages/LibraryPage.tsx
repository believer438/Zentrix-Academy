import { useMemo, useState } from "react";
import { Brain, Download, ExternalLink, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface LibraryPageProps {
  onOpenAI: () => void;
}

export default function LibraryPage({ onOpenAI }: LibraryPageProps) {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const cards = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bibliotheque</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Retrouvez ici vos livres et ressources d'apprentissage.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un livre ou un auteur..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <article key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() =>
                    toast({
                      title: "Lecture a connecter",
                      description: "Le bouton Lire ouvrira la ressource des que l'URL backend sera disponible.",
                    })
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 text-sm text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Lire
                </button>
                <button
                  onClick={() =>
                    toast({
                      title: "Telechargement a connecter",
                      description: "Le fichier pourra etre telecharge quand l'API de ressources sera branchee.",
                    })
                  }
                  className="rounded-xl bg-slate-100 px-3 py-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button onClick={onOpenAI} className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-purple-600">
                  <Brain className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
