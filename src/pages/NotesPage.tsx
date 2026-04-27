import { useMemo, useState } from "react";
import { Calendar, Plus, Search, StickyNote, Tag, Trash2 } from "lucide-react";
import PageHero from "@/components/ui/PageHero";

interface Note {
  id: string;
  title: string;
  course: string;
  updatedAt: string;
  excerpt: string;
  body: string;
  tags: string[];
}

const SEED_NOTES: Note[] = [
  {
    id: "n-1",
    title: "Pandas — opérations groupby",
    course: "Introduction à la Data Science",
    updatedAt: "Il y a 2 heures",
    excerpt: "groupby + agg permettent de produire des résumés rapides...",
    body: `# Pandas — opérations groupby

L'opération **groupby** permet de scinder un DataFrame en groupes selon une ou plusieurs colonnes, puis d'appliquer une fonction à chaque groupe.

## Pattern courant

\`\`\`python
df.groupby("category").agg({
    "amount": "sum",
    "id": "count",
})
\`\`\`

## À retenir
- \`groupby\` est paresseux : aucun calcul n'est effectué tant qu'on n'agrège pas
- Combiner avec \`reset_index()\` pour retrouver un DataFrame "plat"
- Pour des opérations fenêtrées, préférer \`transform\``,
    tags: ["pandas", "python", "data"],
  },
  {
    id: "n-2",
    title: "React — useEffect vs useLayoutEffect",
    course: "React 18 — De zéro à expert",
    updatedAt: "Hier",
    excerpt: "useLayoutEffect s'exécute de façon synchrone après les mutations DOM...",
    body: `# React — useEffect vs useLayoutEffect

**useEffect** s'exécute après le rendu et la peinture du navigateur. Idéal pour la plupart des effets de bord (fetch, abonnements, timers).

**useLayoutEffect** s'exécute synchroniquement après les mutations DOM, mais avant la peinture. À utiliser uniquement quand on doit lire la mise en page (taille, position) et synchroniser un re-rendu visuellement avant que l'utilisateur ne voie un flash.

## Règle d'or
Préférer toujours \`useEffect\` sauf cas spécifique mesuré.`,
    tags: ["react", "hooks", "performance"],
  },
  {
    id: "n-3",
    title: "UX — Heuristiques de Nielsen",
    course: "UX/UI Design",
    updatedAt: "Il y a 3 jours",
    excerpt: "10 principes universels pour évaluer une interface...",
    body: `# UX — Heuristiques de Nielsen

1. Visibilité de l'état du système
2. Correspondance avec le monde réel
3. Contrôle et liberté de l'utilisateur
4. Cohérence et standards
5. Prévention des erreurs
6. Reconnaissance plutôt que mémorisation
7. Flexibilité et efficacité d'utilisation
8. Esthétique et design minimaliste
9. Aider à reconnaître, diagnostiquer et récupérer des erreurs
10. Aide et documentation

Ces 10 heuristiques restent un excellent point de départ pour toute revue d'interface.`,
    tags: ["ux", "design", "heuristiques"],
  },
  {
    id: "n-4",
    title: "OWASP Top 10 — Résumé",
    course: "Cybersécurité",
    updatedAt: "Il y a 5 jours",
    excerpt: "Les 10 vulnérabilités web les plus critiques en 2024...",
    body: `# OWASP Top 10 — Résumé

1. **Broken Access Control** — accès à des ressources non autorisées
2. **Cryptographic Failures** — données sensibles mal chiffrées
3. **Injection** — SQL, NoSQL, OS, LDAP, etc.
4. **Insecure Design** — défauts de conception
5. **Security Misconfiguration** — config par défaut, headers manquants
6. **Vulnerable Components** — dépendances obsolètes
7. **Authentication Failures** — sessions et mots de passe
8. **Software & Data Integrity Failures** — supply chain
9. **Security Logging Failures** — visibilité insuffisante
10. **Server-Side Request Forgery (SSRF)**`,
    tags: ["security", "owasp", "web"],
  },
];

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<string>(SEED_NOTES[0].id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q.length === 0
      ? SEED_NOTES
      : SEED_NOTES.filter((n) =>
          [n.title, n.course, n.excerpt, ...n.tags].some((v) => v.toLowerCase().includes(q)),
        );
  }, [search]);

  const activeNote = SEED_NOTES.find((n) => n.id === activeNoteId) ?? SEED_NOTES[0];

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900">
      <PageHero
        eyebrow="Espace personnel"
        title="Mes Notes"
        subtitle="Organisez et retrouvez en un clin d'œil vos notes de cours, vos résumés et vos idées."
        backgroundImage="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&h=600&fit=crop"
        icon={<StickyNote className="h-7 w-7" />}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[340px] flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {filtered.length} note{filtered.length > 1 ? "s" : ""}
              </h2>
              <button className="bg-[#FF6B00] p-2 text-white hover:bg-[#e56000]" aria-label="Nouvelle note">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dans vos notes..."
                className="w-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <button
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`block w-full border-l-4 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-[#FF6B00] bg-orange-50 dark:bg-orange-950/20"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                    {note.title}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#FF6B00]">
                    {note.course}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {note.excerpt}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">{note.updatedAt}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
                {activeNote.course}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {activeNote.title}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3 w-3" />
                {activeNote.updatedAt}
              </p>
            </div>
            <button className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-900">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap gap-2">
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <Tag className="h-3 w-3 text-[#FF6B00]" />
                    {tag}
                  </span>
                ))}
              </div>
              <article className="border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {activeNote.body}
                </pre>
              </article>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
