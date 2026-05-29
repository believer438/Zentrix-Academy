import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2,
  ChevronLeft, Clock, GraduationCap, Loader2, Menu, Play,
  Sparkles, Star, Users, Video, X,
} from "lucide-react";
import { type Course } from "@/lib/backend-types";
import { type BackendChapter, apiGetCourseChapters, apiUpdateCatalogueProgress, isAuthenticated } from "@/lib/api-client";
import { buildLessonSegments, type LessonSegment } from "@/lib/mock-data";
import { useAITracking } from "@/hooks/useAITracking";
import { useActivityTracker } from "@/hooks/useActivityTracker";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onOpenAI: () => void;
}

type Slide =
  | { kind: "cover" }
  | { kind: "segment"; segment: LessonSegment; index: number }
  | { kind: "done" };

function backendChapterToSegment(chapter: BackendChapter): LessonSegment {
  const paragraphs: string[] = [];
  if (chapter.description) paragraphs.push(chapter.description);
  if (chapter.content) {
    const chunks = chapter.content.split("\n\n").filter(Boolean);
    paragraphs.push(...chunks.slice(0, 10));
  }
  if (paragraphs.length === 0) paragraphs.push("Contenu du chapitre à venir.");
  return {
    id: `ch-${chapter.id}`,
    heading: chapter.title,
    paragraphs,
    videoUrl: chapter.video_url || "",
    videoTitle: chapter.title,
    videoDescription: chapter.description || "",
    videoDuration: chapter.duration_min > 0 ? `${chapter.duration_min} min` : "",
  };
}

export default function CourseDetail({ course, onBack, onOpenAI }: CourseDetailProps) {
  const [backendChapters, setBackendChapters] = useState<BackendChapter[] | null>(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [planOpen, setPlanOpen] = useState(true);
  const [current, setCurrent] = useState(0);

  // Derive the current chapter from slide index
  const currentChapter =
    backendChapters && current > 0 && current <= backendChapters.length
      ? backendChapters[current - 1]
      : null;

  // Tell the AI where the student is (session context)
  useAITracking({
    courseId:     course.backendId,
    courseTitle:  course.title,
    chapterId:    currentChapter?.id,
    chapterTitle: currentChapter?.title,
  });

  // Log activity events for AI behavioral context
  const { logEvent } = useActivityTracker({
    courseId:     course.backendId,
    chapterId:    currentChapter?.id,
    chapterTitle: currentChapter?.title,
  });

  // Wrapper : log CHAT_OPEN avant d'ouvrir le panneau IA
  const handleOpenAI = useCallback(() => {
    logEvent("CHAT_OPEN", { chapter: currentChapter?.title });
    onOpenAI();
  }, [logEvent, onOpenAI, currentChapter?.title]);

  useEffect(() => {
    if (!course.backendId) return;
    setLoadingChapters(true);
    apiGetCourseChapters(course.backendId)
      .then(setBackendChapters)
      .catch(() => setBackendChapters([]))
      .finally(() => setLoadingChapters(false));
  }, [course.backendId]);

  const segments = useMemo<LessonSegment[]>(() => {
    if (course.backendId !== undefined) {
      if (backendChapters === null) return [];
      return backendChapters.map((ch) => backendChapterToSegment(ch));
    }
    return buildLessonSegments(course);
  }, [course, backendChapters]);

  const slides: Slide[] = useMemo(
    () => [
      { kind: "cover" },
      ...segments.map((segment, index) => ({ kind: "segment" as const, segment, index })),
      { kind: "done" },
    ],
    [segments],
  );

  const total = slides.length;

  // Log CHAPTER_COMPLETE quand l'étudiant atteint la slide "done"
  const isDoneSlide = slides[current]?.kind === "done";
  useEffect(() => {
    if (isDoneSlide && course.backendId) {
      logEvent("CHAPTER_COMPLETE", {
        course_id:     course.backendId,
        chapters_done: backendChapters?.length,
      });
    }
  }, [isDoneSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setCurrent(clamped);
    },
    [total],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    touchStart.current = null;
  };

  // ── Proactive AI — blocking detection ──────────────────────────────────────
  // If the student stays on the same chapter for 3 minutes, suggest AI help
  const [showBlockingHint, setShowBlockingHint] = useState(false);

  useEffect(() => {
    setShowBlockingHint(false); // reset on every chapter change
    if (!currentChapter) return;

    const timer = setTimeout(() => {
      setShowBlockingHint(true);
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearTimeout(timer);
  }, [currentChapter?.id]);

  const progressPct = (current / Math.max(total - 1, 1)) * 100;

  // Sauvegarde de la progression catalogue en DB (debounce 1.5s)
  useEffect(() => {
    if (!course.backendId || !isAuthenticated()) return;
    const pct = Math.round(progressPct);
    const t = setTimeout(() => {
      apiUpdateCatalogueProgress(course.backendId!, pct).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [progressPct, course.backendId]);

  if (loadingChapters) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
          <p className="text-sm font-medium">Chargement des chapitres…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full flex-col bg-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <div className="z-20 flex flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-[#FF6B00] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Cours</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Plan toggle */}
        <button
          onClick={() => setPlanOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            planOpen ? "text-[#FF6B00]" : "text-slate-500 hover:text-[#FF6B00]"
          }`}
          title="Afficher / masquer le plan"
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">Plan</span>
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF6B00]">
            {course.categoryName}
          </p>
          <p className="truncate text-xs font-semibold text-slate-800">{course.title}</p>
        </div>

        {/* AI button */}
        <button
          onClick={handleOpenAI}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
        >
          <Brain className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">IA</span>
        </button>
      </div>

      {/* ── PROGRESS BAR ─────────────────────────────────────── */}
      <div className="h-[2px] w-full flex-shrink-0 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-[#FFB347] to-[#FF6B00] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── MAIN AREA ─────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── LEFT PLAN SIDEBAR (pushes content) ────────────── */}
        <aside
          className={`flex-shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
            planOpen ? "w-64" : "w-0"
          }`}
        >
          <div className="flex h-full w-64 flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Plan du cours
              </p>
              <button
                onClick={() => setPlanOpen(false)}
                className="rounded p-1 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Chapter list */}
            <div className="flex-1 overflow-y-auto py-2">
              {/* Cover */}
              <button
                onClick={() => goTo(0)}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                  current === 0
                    ? "border-l-2 border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                    : "border-l-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Star className={`h-3.5 w-3.5 flex-shrink-0 ${current === 0 ? "text-[#FF6B00]" : "text-slate-300"}`} />
                <span className="text-xs font-semibold">Introduction</span>
              </button>

              {/* Chapters */}
              {segments.length > 0 && (
                <>
                  <p className="mt-3 mb-1 px-4 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-300">
                    {segments.length} chapitre{segments.length !== 1 ? "s" : ""}
                  </p>
                  {segments.map((seg, i) => {
                    const slideIdx = i + 1;
                    const isCurrent = current === slideIdx;
                    const isDone = current > slideIdx;
                    return (
                      <button
                        key={seg.id}
                        onClick={() => goTo(slideIdx)}
                        className={`flex w-full items-start gap-2.5 border-l-2 px-4 py-2.5 text-left transition-colors ${
                          isCurrent
                            ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                            : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            isCurrent
                              ? "bg-[#FF6B00] text-white"
                              : isDone
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </span>
                        <span className="flex-1 text-xs font-medium leading-snug">{seg.heading}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {segments.length === 0 && course.backendId && (
                <p className="px-4 py-6 text-center text-xs text-slate-400">
                  Aucun chapitre disponible.
                </p>
              )}

              {/* Done */}
              <button
                onClick={() => goTo(total - 1)}
                className={`mt-1 flex w-full items-center gap-2.5 border-l-2 px-4 py-2.5 text-left transition-colors ${
                  current === total - 1
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 ${current === total - 1 ? "text-emerald-500" : "text-slate-300"}`} />
                <span className="text-xs font-semibold">Fin du cours</span>
              </button>
            </div>

            {/* Progress footer */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-400">Progression</span>
                <span className="font-bold text-[#FF6B00]">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FFB347] to-[#FF6B00] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-center text-[9px] text-slate-300">
                {current} / {total - 1} étapes
              </p>
            </div>
          </div>
        </aside>

        {/* ── SLIDE TRACK ──────────────────────────────────────── */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-white">
          <div
            className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{
              width: `${total * 100}%`,
              transform: `translateX(-${(current / total) * 100}%)`,
            }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="h-full overflow-y-auto"
                style={{ width: `${100 / total}%` }}
              >
                {slide.kind === "cover" && (
                  <CoverSlide course={course} onStart={next} />
                )}
                {slide.kind === "segment" && (
                  <SegmentSlide
                    segment={slide.segment}
                    index={slide.index}
                    total={segments.length}
                  />
                )}
                {slide.kind === "done" && (
                  <DoneSlide course={course} onBack={onBack} onOpenAI={handleOpenAI} />
                )}
              </div>
            ))}
          </div>

          {/* Prev arrow */}
          {current > 0 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-400 shadow-sm hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors sm:left-5"
              aria-label="Précédent"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Next arrow */}
          {current < total - 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-slate-200 bg-white text-slate-400 shadow-sm hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors sm:right-5"
              aria-label="Suivant"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV ───────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-center gap-3 border-t border-slate-100 bg-white py-2.5">
        <span className="text-[10px] font-semibold tabular-nums text-slate-300">
          {current + 1} / {total}
        </span>
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                background:
                  i === current
                    ? "linear-gradient(90deg,#FFB347,#FF6B00)"
                    : i < current
                    ? "rgba(255,107,0,0.3)"
                    : "#e2e8f0",
              }}
              aria-label={`Aller à la page ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-300">← →</span>
      </div>

      {/* ── PROACTIVE AI BLOCKING HINT ───────────────────────────────────── */}
      {showBlockingHint && currentChapter && (
        <div className="absolute bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl shadow-[#FF6B00]/10">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] shadow">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">
                Cette partie semble difficile ?
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                Je peux t'expliquer <span className="font-medium text-slate-700">«&nbsp;{currentChapter.title}&nbsp;»</span> autrement, avec des exemples concrets.
              </p>
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => { setShowBlockingHint(false); handleOpenAI(); }}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-3 py-1.5 text-[11px] font-bold text-white shadow transition-opacity hover:opacity-90"
                >
                  Oui, aide-moi
                </button>
                <button
                  onClick={() => setShowBlockingHint(false)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
                >
                  Non merci
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Cover Slide ─────────────────────────────────────────────────────────── */
function CoverSlide({ course, onStart }: { course: Course; onStart: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-white px-6 py-12">
      {/* Cover image */}
      {course.coverImage && (
        <div className="mb-8 w-full max-w-2xl overflow-hidden rounded-none shadow-lg">
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="w-full max-w-2xl text-center">
        <span className="inline-block border border-[#FF6B00]/30 bg-orange-50 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#FF6B00]">
          {course.categoryName}
        </span>

        <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
          {course.title}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
          {course.description}
        </p>

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          {course.estimatedDuration > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.estimatedDuration}h de contenu
            </span>
          )}
          {course.chaptersCount > 0 && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.chaptersCount} chapitre{course.chaptersCount !== 1 ? "s" : ""}
            </span>
          )}
          {course.enrolledCount != null && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.enrolledCount.toLocaleString("fr-FR")} inscrits
            </span>
          )}
          {course.professor && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.professor}
            </span>
          )}
        </div>

        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2.5 bg-[#FF6B00] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-md shadow-[#FF6B00]/25 transition-all hover:bg-[#e56000] hover:shadow-lg"
        >
          <Play className="h-4 w-4 fill-white" />
          Commencer
        </button>

        <p className="mt-4 text-[10px] text-slate-300">
          Utilisez les flèches ou swipez pour naviguer
        </p>
      </div>
    </div>
  );
}

/* ── Segment Slide ───────────────────────────────────────────────────────── */
function SegmentSlide({
  segment,
  index,
  total,
}: {
  segment: LessonSegment;
  index: number;
  total: number;
}) {
  const hasVideo = Boolean(segment.videoUrl);

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Chapter header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-4 lg:px-10">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#FF6B00] text-xs font-bold text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-300">
            Chapitre {index + 1} sur {total}
          </p>
          <h2 className="truncate text-base font-bold text-slate-900">{segment.heading}</h2>
        </div>
      </div>

      {/* Content area */}
      <div className={`flex flex-1 ${hasVideo ? "flex-col lg:flex-row" : "flex-col"}`}>
        {/* Text content */}
        <div className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-5 text-[15px] leading-8 text-slate-600">
              {segment.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Video */}
        {hasVideo && (
          <div className="w-full flex-shrink-0 border-t border-slate-100 bg-slate-50 lg:w-[44%] lg:border-l lg:border-t-0">
            <div className="relative aspect-video w-full bg-black">
              {segment.videoUrl.includes("youtube") ? (
                <iframe
                  src={
                    segment.videoUrl
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "www.youtube.com/embed/") +
                    "?rel=0&modestbranding=1"
                  }
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src={segment.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
            <div className="flex items-start gap-3 border-t border-slate-200 bg-white px-4 py-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-orange-200 bg-orange-50">
                <Video className="h-3.5 w-3.5 text-[#FF6B00]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{segment.videoTitle}</p>
                {segment.videoDescription && (
                  <p className="truncate text-[10px] text-slate-400">{segment.videoDescription}</p>
                )}
              </div>
              {segment.videoDuration && (
                <span className="flex items-center gap-1 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  <Play className="h-2.5 w-2.5" />
                  {segment.videoDuration}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Done Slide ──────────────────────────────────────────────────────────── */
function DoneSlide({
  course,
  onBack,
  onOpenAI,
}: {
  course: Course;
  onBack: () => void;
  onOpenAI: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-white px-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center border-2 border-emerald-200 bg-emerald-50">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">
        Cours terminé
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-900">Félicitations !</h2>
      <p className="mt-4 max-w-md text-center text-sm leading-7 text-slate-500">
        Vous avez parcouru toutes les sections de{" "}
        <span className="font-semibold text-slate-800">« {course.title} »</span>.<br />
        Continuez sur votre lancée.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onOpenAI}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#FF6B00]/25 hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4" />
          Réviser avec l'IA
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </button>
      </div>
    </div>
  );
}
