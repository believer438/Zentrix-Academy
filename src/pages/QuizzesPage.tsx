import { useMemo, useState } from "react";
import {
  BarChart3,
  Brain,
  ClipboardCheck,
  Clock,
  Hash,
  Play,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";
import { mockQuizzes } from "@/lib/mock-data";

interface QuizzesPageProps {
  onOpenAI: () => void;
}

const FILTERS: { key: "all" | "practice" | "exam" | "revision"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "practice", label: "Pratique" },
  { key: "exam", label: "Examens" },
  { key: "revision", label: "Révision" },
];

const TYPE_LABEL: Record<string, string> = {
  practice: "Pratique",
  exam: "Examen",
  revision: "Révision",
};

export default function QuizzesPage({ onOpenAI }: QuizzesPageProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "practice" | "exam" | "revision">("all");
  const { toast } = useToast();

  const quizzes = useMemo(
    () => (activeFilter === "all" ? mockQuizzes : mockQuizzes.filter((q) => q.quizType === activeFilter)),
    [activeFilter],
  );

  const stats = useMemo(() => {
    const completed = mockQuizzes.filter((q) => q.bestScore !== null);
    const avg =
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce((acc, q) => acc + (q.bestScore ?? 0), 0) / completed.length,
          );
    return {
      total: mockQuizzes.length,
      completed: completed.length,
      avg,
    };
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Évaluations"
        title="Quiz & Examens"
        subtitle="Testez vos connaissances et préparez-vous avec des évaluations adaptées à votre rythme."
        backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=600&fit=crop"
        icon={<ClipboardCheck className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Hash, label: "Quiz disponibles", value: stats.total, accent: "text-blue-600" },
            { icon: Trophy, label: "Quiz complétés", value: stats.completed, accent: "text-emerald-600" },
            { icon: BarChart3, label: "Score moyen", value: `${stats.avg}%`, accent: "text-[#FF6B00]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 border-l-4 border-[#FF6B00] bg-white p-4 shadow-sm dark:border-orange-500/60 dark:bg-slate-950"
            >
              <div className={`flex h-10 w-10 items-center justify-center bg-slate-100 dark:bg-slate-800 ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeFilter === f.key
                    ? "bg-[#FF6B00] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={onOpenAI}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Brain className="h-4 w-4" />
            Générer un quiz IA
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-white dark:text-slate-900">
                    {TYPE_LABEL[quiz.quizType]}
                  </span>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {quiz.courseName}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight text-slate-900 dark:text-white">
                    {quiz.title}
                  </h3>
                </div>
                {quiz.bestScore !== null ? (
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {quiz.bestScore}%
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Meilleur score
                    </span>
                  </div>
                ) : (
                  <span className="shrink-0 border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Nouveau
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.description}</p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-[#FF6B00]" /> {quiz.questionCount} questions
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#FF6B00]" /> {quiz.timeLimit} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-[#FF6B00]" /> {quiz.passingScore}% requis
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() =>
                    toast({
                      title: "Quiz lancé",
                      description: `« ${quiz.title} » démarre maintenant. Bonne chance !`,
                    })
                  }
                  className="flex flex-1 items-center justify-center gap-2 bg-[#FF6B00] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#e56000]"
                >
                  <Play className="h-4 w-4" />
                  Commencer
                </button>
                {quiz.attempts > 0 && (
                  <button
                    onClick={() =>
                      toast({
                        title: "Reprise de la dernière tentative",
                        description: `Vous reprenez « ${quiz.title} » là où vous l'avez laissé.`,
                      })
                    }
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reprendre
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
