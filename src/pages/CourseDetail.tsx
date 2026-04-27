import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Lock,
  PanelLeftOpen,
  Play,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { type Course } from "@/lib/backend-types";
import {
  buildChaptersForCourse,
  buildLessonSegments,
  type LessonSegment,
} from "@/lib/mock-data";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onOpenAI: () => void;
}

export default function CourseDetail({ course, onBack, onOpenAI }: CourseDetailProps) {
  const chapters = useMemo(() => buildChaptersForCourse(course), [course]);
  const segments = useMemo(() => buildLessonSegments(course), [course]);

  const [openChapterId, setOpenChapterId] = useState<string | null>(chapters[0]?.id ?? null);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(segments[0]?.id ?? null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const segmentRefs = useRef<Record<string, HTMLElement | null>>({});

  const currentLessonTitle = chapters[0]?.lessons[0]?.title ?? "Leçon 1";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-segment-id");
          if (id) setActiveSegmentId(id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.3, 0.6] },
    );
    Object.values(segmentRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [segments]);

  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);
  const completedLessons = chapters.reduce(
    (acc, c) => acc + c.lessons.filter((l) => l.isCompleted).length,
    0,
  );
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const scrollToSegment = (id: string) => {
    setMobileSidebarOpen(false);
    const el = segmentRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sidebarContent = (
    <>
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <div
          className="relative h-28 w-full overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('${course.coverImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB347]">
              {course.categoryName}
            </p>
          </div>
        </div>
        <h2 className="mt-4 text-base font-bold leading-tight text-slate-900 dark:text-white">
          {course.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{course.professor}</p>

        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>Progression</span>
          <span className="text-[#FF6B00]">{progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#FFB347] to-[#FF6B00]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Plan du cours
        </p>
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isOpen = openChapterId === chapter.id;
            const completed = chapter.lessons.filter((l) => l.isCompleted).length;
            return (
              <div
                key={chapter.id}
                className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  onClick={() => setOpenChapterId(isOpen ? null : chapter.id)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#FF6B00]/10 text-xs font-bold text-[#FF6B00]">
                    {chapter.orderIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {chapter.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {completed}/{chapter.lessons.length} leçons
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800">
                    {chapter.lessons.map((lesson) => {
                      const Icon = lesson.isCompleted
                        ? CheckCircle2
                        : lesson.isLocked
                          ? Lock
                          : Circle;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-xs ${
                            lesson.isLocked
                              ? "text-slate-400 dark:text-slate-600"
                              : "text-slate-600 dark:text-slate-300"
                          } ${lesson.isCompleted ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""}`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              lesson.isCompleted ? "text-emerald-500" : ""
                            }`}
                          />
                          <span className="flex-1 truncate">{lesson.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {lesson.estimatedDuration}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Sections de cette leçon
          </p>
          <div className="mt-2 space-y-1">
            {segments.map((seg, idx) => {
              const isActive = activeSegmentId === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => scrollToSegment(seg.id)}
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-[#FF6B00] text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`shrink-0 text-[10px] font-bold ${
                      isActive ? "text-white/90" : "text-[#FF6B00]"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 leading-tight">{seg.heading}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-[320px] flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        {sidebarContent}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Cours
          </button>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
              {course.categoryName}
            </p>
            <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {currentLessonTitle}
            </h1>
          </div>
          <button
            onClick={onOpenAI}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Demander à l'IA</span>
            <span className="sm:hidden">IA</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <section
            className="relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url('${course.coverImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/50" />
            <div className="absolute inset-y-0 left-0 w-1 bg-[#FF6B00]" />
            <div className="relative mx-auto max-w-4xl px-6 py-12 md:py-16">
              <span className="inline-flex items-center gap-2 border-l-2 border-[#FF6B00] bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FFB347]">
                Leçon en cours
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
                {currentLessonTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#FFB347]" />
                  {course.estimatedDuration}h au total
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#FFB347]" />
                  {course.lessonsCount} leçons
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#FFB347]" />
                  {course.enrolledCount.toLocaleString("fr-FR")} inscrits
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[#FFB347]" />
                  Animé par {course.professor}
                </span>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 border-l-4 border-[#FF6B00] bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B00]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                    Comment suivre cette leçon
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                    Faites défiler pour parcourir les sections. Chaque partie contient
                    une explication écrite suivie d'une vidéo. Vous pouvez à tout
                    moment cliquer sur une section dans le panneau de gauche pour y
                    sauter directement.
                  </p>
                </div>
              </div>
            </div>

            <article className="space-y-12">
              {segments.map((segment, index) => (
                <LessonSection
                  key={segment.id}
                  segment={segment}
                  index={index}
                  total={segments.length}
                  registerRef={(el) => {
                    segmentRefs.current[segment.id] = el;
                  }}
                />
              ))}
            </article>

            <div className="mt-12 border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Vous avez terminé cette leçon
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Marquez la leçon comme terminée pour débloquer la suivante et
                    mettre à jour votre progression.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-2 bg-[#FF6B00] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#e56000]">
                      <CheckCircle2 className="h-4 w-4" />
                      Marquer comme terminée
                    </button>
                    <button
                      onClick={onOpenAI}
                      className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Brain className="h-4 w-4" />
                      Réviser avec l'IA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LessonSection({
  segment,
  index,
  total,
  registerRef,
}: {
  segment: LessonSegment;
  index: number;
  total: number;
  registerRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={registerRef}
      data-segment-id={segment.id}
      className="scroll-mt-24"
    >
      <header className="mb-5">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          <span className="text-[#FF6B00]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <FileText className="h-3.5 w-3.5" />
          Section
        </div>
        <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">
          {segment.heading}
        </h3>
      </header>

      <div className="prose prose-slate max-w-none dark:prose-invert prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed">
        {segment.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <figure className="mt-6 overflow-hidden border border-slate-200 bg-slate-950 shadow-md dark:border-slate-800">
        <div className="aspect-video w-full bg-black">
          <video
            controls
            preload="metadata"
            playsInline
            className="h-full w-full"
            poster={`https://placehold.co/1280x720/0f1219/FF6B00?text=${encodeURIComponent(`Vidéo · ${segment.videoDuration}`)}`}
          >
            <source src={segment.videoUrl} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        </div>
        <figcaption className="flex items-start gap-3 border-t border-slate-800 bg-slate-900 px-5 py-4 text-white">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#FF6B00]/15 text-[#FFB347]">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{segment.videoTitle}</p>
            <p className="mt-0.5 text-xs text-white/70">
              {segment.videoDescription}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
            <Play className="h-3 w-3" />
            {segment.videoDuration}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
