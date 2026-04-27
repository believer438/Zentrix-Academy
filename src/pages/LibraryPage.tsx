import { useMemo, useState } from "react";
import { BookMarked, Brain, Download, ExternalLink, Filter, Languages, Search } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";
import { mockBooks } from "@/lib/mock-data";

interface LibraryPageProps {
  onOpenAI: () => void;
}

export default function LibraryPage({ onOpenAI }: LibraryPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const { toast } = useToast();

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(mockBooks.map((b) => b.categoryName)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockBooks.filter((b) => {
      const matchesQuery =
        q.length === 0 ||
        [b.title, b.author, b.description, b.categoryName].some((v) =>
          v.toLowerCase().includes(q),
        );
      const matchesCategory = category === "Toutes" || b.categoryName === category;
      return matchesQuery && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Ressources"
        title="Bibliothèque Zentrix"
        subtitle="Une collection sélectionnée de livres et ressources pour aller plus loin sur chaque sujet."
        backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&h=600&fit=crop"
        icon={<BookMarked className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {filtered.length} ressource{filtered.length > 1 ? "s" : ""} disponible
              {filtered.length > 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Filtrez par catégorie ou recherchez un titre, un auteur, un sujet.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre, auteur, sujet..."
                className="w-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-72"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <article
              key={book.id}
              className="group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div
                className="relative h-56 w-full overflow-hidden bg-slate-100 bg-cover bg-center dark:bg-slate-800"
                style={{ backgroundImage: `url('${book.coverImage}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-[#FF6B00] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {book.categoryName}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-base font-bold leading-tight drop-shadow">{book.title}</p>
                  <p className="mt-0.5 text-xs text-white/80">{book.author}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                  {book.description}
                </p>
                <div className="mt-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <BookMarked className="h-3 w-3" /> {book.pageCount} p.
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="h-3 w-3" /> {book.language}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      toast({
                        title: "Ouverture du lecteur",
                        description: `« ${book.title} » s'ouvre dans la liseuse.`,
                      })
                    }
                    className="flex flex-1 items-center justify-center gap-2 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Lire
                  </button>
                  <button
                    onClick={() =>
                      toast({
                        title: "Téléchargement lancé",
                        description: `« ${book.title} » est en cours de téléchargement.`,
                      })
                    }
                    className="border border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                    aria-label="Télécharger"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={onOpenAI}
                    className="border border-orange-200 bg-orange-50 px-3 py-2 text-[#FF6B00] hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20"
                    aria-label="Demander à l'IA"
                  >
                    <Brain className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950">
            <Search className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Aucune ressource ne correspond à votre recherche.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("Toutes");
              }}
              className="mt-4 bg-[#FF6B00] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
