import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Clock, Search, Star, Users } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import PageHero from "@/components/ui/PageHero";
import { type Course } from "@/lib/backend-types";

interface CoursesPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

function isSimulationCourse(course: Course) {
  const values = [course.title, course.description, course.categoryName, ...course.tags];
  return values.some((value) => value.toLowerCase().includes("simulation"));
}

const mockCourses: Course[] = [];

interface CourseOutlineChapter {
  title: string;
  points: string[];
}

function buildCourseOutline(course: Course): CourseOutlineChapter[] {
  const chapterCount = Math.max(
    3,
    Math.min(
      course.chaptersCount || Math.ceil(Math.max(course.lessonsCount, 1) / 3),
      8
    )
  );

  const normalizedTags = (course.tags ?? [])
    .filter(Boolean)
    .map((tag) => tag.replace(/([a-z])([A-Z])/g, "$1 $2"));

  return Array.from({ length: chapterCount }, (_, index) => {
    const firstTag = normalizedTags[index % Math.max(normalizedTags.length, 1)] ?? "Fondamentaux";
    const secondTag = normalizedTags[(index + 1) % Math.max(normalizedTags.length, 1)] ?? "Pratique";
    return {
      title: `Chapitre ${index + 1}`,
      points: [
        `Concept cle: ${firstTag}`,
        `Point important: ${secondTag}`,
        `Application pratique et recapitulatif`,
      ],
    };
  });
}

function CourseCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="mb-4 h-28 w-full rounded-xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <BookOpen className="h-3.5 w-3.5" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </article>
  );
}

function CourseCard({
  course,
  onSelect,
  onOpen,
}: {
  course: Course;
  onSelect: (course: Course) => void;
  onOpen: (course: Course) => void;
}) {
  const difficultyLabel = {
    beginner: "Debutant",
    intermediate: "Intermediaire",
    advanced: "Avance",
  }[course.difficulty];

  return (
    <article
      onClick={() => onSelect(course)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mb-4 flex h-28 w-full items-end rounded-xl bg-gradient-to-br from-[#FFB347] via-[#FF9A3C] to-[#FF6B00] p-4 text-white">
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {course.categoryName}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {difficultyLabel}
        </span>
        {course.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Star className="h-3.5 w-3.5" />
            Vedette
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
        {course.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
        {course.description}
      </p>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{course.professor}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{course.lessonsCount} lecons</span>
        </div>
        <div className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{course.estimatedDuration}h</span>
        </div>
        <div className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <span>{course.enrolledCount}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpen(course);
        }}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#e56000]"
      >
        Ouvrir le cours
      </button>
    </article>
  );
}

export default function CoursesPage({ onNavigate }: CoursesPageProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoursePreview, setSelectedCoursePreview] = useState<Course | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 3000);

    return () => window.clearTimeout(timeout);
  }, [activeTab]);

  const categories = useMemo(
    () => Array.from(new Set(mockCourses.map((course) => course.categoryName))),
    []
  );

  const baseCourses = useMemo(
    () =>
      activeTab === "all"
        ? mockCourses
        : mockCourses.filter((course) => course.isEnrolled && !isSimulationCourse(course)),
    [activeTab]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return baseCourses.filter((course) => {
      const matchesSearch =
        query.length === 0 ||
        [
          course.title,
          course.description,
          course.professor,
          course.categoryName,
          ...course.tags,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesCategory =
        category === "all" || course.categoryName === category;

      const matchesLevel = level === "all" || course.difficulty === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [baseCourses, category, level, search]);

  const featuredCourses = useMemo(() => {
    const featured = filteredCourses.filter((course) => course.isFeatured);
    if (featured.length >= 4) return featured.slice(0, 4);
    const fillers = filteredCourses.filter((course) => !featured.some((item) => item.id === course.id));
    return [...featured, ...fillers].slice(0, 4);
  }, [filteredCourses]);

  const regularCourses = useMemo(
    () =>
      activeTab === "all"
        ? filteredCourses.filter((course) => !course.isFeatured)
        : filteredCourses.slice(0, 6),
    [activeTab, filteredCourses]
  );

  const selectedOutline = useMemo(
    () => (selectedCoursePreview ? buildCourseOutline(selectedCoursePreview) : []),
    [selectedCoursePreview]
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setLevel("all");
  };

  const outlineBody = !selectedCoursePreview ? (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      Choisissez un cours pour afficher son plan ici.
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Cours selectionne
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
          {selectedCoursePreview.title}
        </p>
      </div>

      {selectedOutline.map((chapter, index) => (
        <div
          key={`${chapter.title}-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6B00] dark:text-orange-400">
            {chapter.title}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {chapter.points.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const title = activeTab === "all" ? "Tous les cours" : "Mes cours";
  const description =
    activeTab === "all"
      ? "Decouvrez le catalogue et trouvez rapidement le cours qui vous convient."
      : "Retrouvez ici les cours auxquels vous etes deja inscrit.";

  return (
    <div className="w-full space-y-6 bg-white p-4 sm:p-6 dark:bg-slate-900">
      <PageHero
        title="Tous les cours"
        subtitle="Explorez nos formations et démarrez votre parcours d'apprentissage dès aujourd'hui"
        backgroundImage="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop"
        icon={<BookOpen className="h-8 w-8" />}
      />

      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOutlineOpen ? "" : "pointer-events-none"}`}>
        <button
          aria-label="Fermer le panneau de plan du cours"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileOutlineOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOutlineOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-r border-slate-200 bg-slate-50 p-4 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 ${
            mobileOutlineOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Plan du cours</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Chapitres, ordre de progression et points importants.
              </p>
            </div>
            <button
              onClick={() => setMobileOutlineOpen(false)}
              aria-label="Fermer"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          {outlineBody}
        </aside>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${isOutlineOpen ? "lg:grid-cols-[340px_1fr]" : "lg:grid-cols-[56px_1fr]"}`}>
        <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              {isOutlineOpen ? (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Plan du cours</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Chapitres, ordre de progression et points importants.
                </p>
              </div>
              ) : null}
              <button
                onClick={() => setIsOutlineOpen((v) => !v)}
                aria-label={isOutlineOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
                title={isOutlineOpen ? "Fermer" : "Ouvrir"}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {isOutlineOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

            {isOutlineOpen && (
              <>{outlineBody}</>
            )}
          </section>
        </aside>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cours</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Retrouvez ici vos cours et les contenus disponibles.
            </p>
            <div className="mt-3 lg:hidden">
              <button
                onClick={() => setMobileOutlineOpen(true)}
                aria-label="Ouvrir le plan du cours"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800">
            {[
              { key: "all" as const, label: "Tous les cours" },
              { key: "mine" as const, label: "Mes cours" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === tab.key
                    ? "border-b-2 border-[#FF6B00] text-[#FF6B00]"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "all" ? "Rechercher un cours..." : "Rechercher dans mes cours..."}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">Toutes les categories</option>
              {categories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">Tous les niveaux</option>
              <option value="beginner">Debutant</option>
              <option value="intermediate">Intermediaire</option>
              <option value="advanced">Avance</option>
            </select>
            <button
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              Reinitialiser
            </button>
          </div>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              {activeTab === "all" ? (
                <Star className="h-5 w-5 text-amber-500" />
              ) : (
                <BookOpen className="h-5 w-5 text-[#FF6B00]" />
              )}
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </section>

          {activeTab === "all" && (
            <section>
              <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Cours en vedette</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading
                  ? [0, 1, 2, 3].map((item) => <CourseCardSkeleton key={item} />)
                  : featuredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelect={setSelectedCoursePreview}
                        onOpen={(selectedCourse) => onNavigate("course-detail", selectedCourse)}
                      />
                    ))}
              </div>
            </section>
          )}

          {isLoading ? (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(activeTab === "all" ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3]).map((item) => (
                <CourseCardSkeleton key={item} />
              ))}
            </section>
          ) : regularCourses.length > 0 ? (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {regularCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={setSelectedCoursePreview}
                  onOpen={(selectedCourse) => onNavigate("course-detail", selectedCourse)}
                />
              ))}
            </section>
          ) : (
            <Empty className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle>Aucun cours trouve</EmptyTitle>
                <EmptyDescription>
                  Aucun cours n'est disponible pour le moment. Revenez un peu plus tard.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

      </div>
    </div>
  );
}
