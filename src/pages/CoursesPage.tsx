import { useCallback, useEffect, useState } from "react";
import {
  BookOpen, Check, ChevronDown, ChevronRight, Clock,
  GraduationCap, Loader2, Search, SlidersHorizontal,
  Sparkles, UserCheck, Users, X,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  type CatalogueCourse,
  apiEnrollCourse, apiGetCatalogue,
  apiGetCatalogueCategories, apiUnenrollCourse,
  isAuthenticated,
} from "@/lib/api-client";
import type { Course } from "@/lib/backend-types";

interface CoursesPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
  intermediate: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  advanced:     "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
};

const ALL_LEVELS = ["beginner", "intermediate", "advanced"];

function catalogueToCourse(c: CatalogueCourse): Course {
  return {
    id: `cat-${c.id}`,
    backendId: c.id,
    title: c.title,
    description: c.description,
    coverImage:
      c.cover_image ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
    categoryId: `cat-${c.category}`,
    categoryName: c.category || "Général",
    professor: c.instructor_name || "Zentrix Academy",
    difficulty: c.level as Course["difficulty"],
    estimatedDuration: c.duration_hours,
    chaptersCount: c.chapters?.length ?? 0,
    lessonsCount: c.chapters?.length ?? 0,
    enrolledCount: c.enrolled_count,
    progress: 0,
    isEnrolled: c.is_enrolled,
    isFeatured: c.is_published,
    tags: c.tags
      ? c.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
  };
}

// ── Skeleton: course card ─────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="h-44 w-full" />
      <div className="flex flex-1 flex-col p-4 gap-3">
        <Skeleton className="h-3 w-20" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex gap-1.5 mt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex gap-2 mt-auto pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton: filter sidebar ──────────────────────────────────────────────────
function FilterSidebarSkeleton() {
  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
        {[80, 64, 72, 56].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5 px-2 py-1">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className={`h-3`} style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-4" />
        </div>
        {[3].map((_, i) =>
          ["beginner", "intermediate", "advanced"].map((lvl) => (
            <div key={`${i}-${lvl}`} className="flex items-center gap-2.5 px-2 py-1">
              <Skeleton className="h-4 w-4 flex-shrink-0" />
              <Skeleton className={`h-5 w-24 rounded-full`} />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

// ── Course card (real) ────────────────────────────────────────────────────────
function CourseCard({
  course,
  onView,
  onEnrollToggle,
  enrolling,
}: {
  course: CatalogueCourse;
  onView: () => void;
  onEnrollToggle: () => void;
  enrolling: boolean;
}) {
  const tags = course.tags
    ? course.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div
        className="relative h-44 w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900"
        onClick={onView}
      >
        {course.cover_image ? (
          <img
            src={course.cover_image}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFB347]/20 to-[#FF6B00]/20">
            <BookOpen className="h-14 w-14 text-[#FF6B00]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${LEVEL_COLORS[course.level] ?? LEVEL_COLORS.beginner}`}
        >
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>
        {course.is_enrolled && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <UserCheck className="h-3 w-3" />
            Inscrit
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
          {course.category || "Général"}
        </p>
        <h3
          onClick={onView}
          className="mb-2 cursor-pointer text-[15px] font-bold leading-snug text-slate-900 transition-colors hover:text-[#FF6B00] dark:text-white dark:hover:text-[#FF6B00] line-clamp-2"
        >
          {course.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {course.description}
        </p>
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-[#FFB347]" />
            {course.instructor_name || "Instructeur"}
          </span>
          {course.duration_hours > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.duration_hours}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[#FFB347]" />
            {course.enrolled_count.toLocaleString("fr-FR")}
          </span>
        </div>
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-1">
          <button
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-1.5 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Voir le cours
          </button>
          <button
            onClick={onEnrollToggle}
            disabled={enrolling}
            className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
              course.is_enrolled
                ? "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
                : "bg-[#FF6B00] text-white hover:bg-[#e56000]"
            }`}
          >
            {enrolling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : course.is_enrolled ? (
              <UserCheck className="h-3.5 w-3.5" />
            ) : (
              <GraduationCap className="h-3.5 w-3.5" />
            )}
            {course.is_enrolled ? "Inscrit" : "S'inscrire"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  selectedLevels,
  onToggleLevel,
  enrolledOnly,
  onToggleEnrolledOnly,
  onClearAll,
  filterCount,
}: {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  selectedLevels: string[];
  onToggleLevel: (lvl: string) => void;
  enrolledOnly: boolean;
  onToggleEnrolledOnly: () => void;
  onClearAll: () => void;
  filterCount: number;
}) {
  const [catOpen, setCatOpen] = useState(true);
  const [lvlOpen, setLvlOpen] = useState(true);

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-[#FF6B00]" />
          Filtres
          {filterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
              {filterCount}
            </span>
          )}
        </span>
        {filterCount > 0 && (
          <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-[#FF6B00]">
            Tout effacer
          </button>
        )}
      </div>

      {/* Enrolled only */}
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <button
          onClick={onToggleEnrolledOnly}
          className={`flex w-full items-center gap-2.5 rounded px-2 py-2 text-sm font-medium transition-colors ${
            enrolledOnly
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
          }`}
        >
          <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors ${
            enrolledOnly ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"
          }`}>
            {enrolledOnly && <Check className="h-3 w-3 text-white" />}
          </span>
          Mes cours inscrits
        </button>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200"
          >
            <span>Catégories</span>
            {catOpen
              ? <ChevronDown className="h-4 w-4 text-slate-400" />
              : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </button>
          {catOpen && (
            <div className="space-y-0.5 px-4 pb-3">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => onToggleCategory(cat)}
                    className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors ${
                      active ? "border-[#FF6B00] bg-[#FF6B00]" : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {active && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className="flex-1 truncate text-left">{cat}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Levels */}
      <div>
        <button
          onClick={() => setLvlOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200"
        >
          <span>Niveau</span>
          {lvlOpen
            ? <ChevronDown className="h-4 w-4 text-slate-400" />
            : <ChevronRight className="h-4 w-4 text-slate-400" />}
        </button>
        {lvlOpen && (
          <div className="space-y-0.5 px-4 pb-3">
            {ALL_LEVELS.map((lvl) => {
              const active = selectedLevels.includes(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => onToggleLevel(lvl)}
                  className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors ${
                    active ? "border-[#FF6B00] bg-[#FF6B00]" : "border-slate-300 dark:border-slate-600"
                  }`}>
                    {active && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LEVEL_COLORS[lvl]}`}>
                    {LEVEL_LABELS[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <BookOpen className="h-9 w-9 text-slate-300 dark:text-slate-600" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
          {hasFilters ? "Aucun cours ne correspond à vos filtres" : "Aucun cours disponible pour le moment"}
        </p>
        <p className="text-sm text-slate-500">
          {hasFilters
            ? "Essayez d'élargir votre recherche en retirant des filtres."
            : "Un administrateur doit créer des cours pour les afficher ici."}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-2 border border-[#FF6B00] px-4 py-2 text-sm font-semibold text-[#FF6B00] hover:bg-[#FF6B00]/5"
        >
          <X className="h-4 w-4" />
          Effacer tous les filtres
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CoursesPage({ onNavigate }: CoursesPageProps) {
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<CatalogueCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [enrolledOnly, setEnrolledOnly] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const authenticated = isAuthenticated();

  const loadCatalogue = useCallback(() => {
    setLoading(true);
    setError(null);
    apiGetCatalogue({ search: search.trim() || undefined })
      .then(setAllCourses)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur réseau"))
      .finally(() => setLoading(false));
  }, [search]);

  const loadCategories = useCallback(() => {
    apiGetCatalogueCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { loadCatalogue(); loadCategories(); }, [loadCatalogue, loadCategories]);

  const filtered = allCourses.filter((c) => {
    if (selectedLevels.length > 0 && !selectedLevels.includes(c.level)) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(c.category)) return false;
    if (enrolledOnly && !c.is_enrolled) return false;
    return true;
  });

  const filterCount =
    selectedCategories.length + selectedLevels.length + (enrolledOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setEnrolledOnly(false);
  };

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const toggleLevel = (lvl: string) =>
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl],
    );

  const handleEnrollToggle = async (course: CatalogueCourse) => {
    if (!authenticated) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour vous inscrire à ce cours.",
      });
      return;
    }
    setEnrollingId(course.id);
    try {
      if (course.is_enrolled) await apiUnenrollCourse(course.id);
      else await apiEnrollCourse(course.id);
      setAllCourses((prev) =>
        prev.map((c) =>
          c.id === course.id
            ? {
                ...c,
                is_enrolled: !c.is_enrolled,
                enrolled_count: c.is_enrolled ? c.enrolled_count - 1 : c.enrolled_count + 1,
              }
            : c,
        ),
      );
    } catch { /* silent */ } finally {
      setEnrollingId(null);
    }
  };

  const handleView = (course: CatalogueCourse) =>
    onNavigate("course-detail", catalogueToCourse(course));

  const sidebar = (
    <FilterSidebar
      categories={categories}
      selectedCategories={selectedCategories}
      onToggleCategory={toggleCategory}
      selectedLevels={selectedLevels}
      onToggleLevel={toggleLevel}
      enrolledOnly={enrolledOnly}
      onToggleEnrolledOnly={() => setEnrolledOnly((v) => !v)}
      onClearAll={clearAll}
      filterCount={filterCount}
    />
  );

  return (
    <div className="w-full min-h-full bg-[#f4f6fb] dark:bg-slate-950">
      <PageHero
        eyebrow="Zentrix Academy"
        title="Catalogue des cours"
        subtitle="Découvrez tous les cours créés par notre équipe pédagogique. Inscrivez-vous et commencez à apprendre."
        backgroundImage="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=600&fit=crop"
        icon={<BookOpen className="h-7 w-7" />}
      />

      {/* Search bar */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              placeholder="Rechercher un cours, instructeur, catégorie…"
              className="w-full border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSearch(searchInput)}
            className="hidden items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e56000] sm:flex"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="relative flex items-center gap-2 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {filterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-y-auto bg-white shadow-xl dark:bg-slate-950 lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Filtres</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebar}</div>
          </div>
        </>
      )}

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Left sidebar — desktop */}
          <div className="hidden lg:block">
            {loading ? <FilterSidebarSkeleton /> : sidebar}
          </div>

          {/* Course grid */}
          <div className="min-w-0 flex-1">
            {/* Stats bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 min-h-[28px]">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </>
              ) : (
                <>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {filtered.length}
                    </span>{" "}
                    cours{filtered.length !== 1 ? " disponibles" : " disponible"}
                    {search && (
                      <span>
                        {" "}pour «{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {search}
                        </span>
                        {" "}»
                      </span>
                    )}
                  </span>
                  {selectedCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-1 rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-2.5 py-0.5 text-xs font-medium text-[#FF6B00]"
                    >
                      {cat} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {selectedLevels.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      {LEVEL_LABELS[lvl]} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {enrolledOnly && (
                    <button
                      onClick={() => setEnrolledOnly(false)}
                      className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                    >
                      Inscrits seulement <X className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Error */}
            {error && !loading && (
              <div className="mb-4 flex items-center justify-between border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                <span>{error}</span>
                <button onClick={loadCatalogue} className="ml-3 text-xs font-semibold underline">
                  Réessayer
                </button>
              </div>
            )}

            {/* Skeleton grid */}
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <EmptyState hasFilters={filterCount > 0 || !!search} onClear={() => { clearAll(); setSearch(""); setSearchInput(""); }} />
            )}

            {/* Actual grid */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onView={() => handleView(course)}
                    onEnrollToggle={() => handleEnrollToggle(course)}
                    enrolling={enrollingId === course.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
