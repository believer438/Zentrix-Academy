import { useState } from "react";
import { Brain, Play, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface QuizzesPageProps {
  onOpenAI: () => void;
}

export default function QuizzesPage({ onOpenAI }: QuizzesPageProps) {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const { toast } = useToast();

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz & Examens</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Entrainez-vous et passez vos evaluations ici.</p>
        </div>
        <button onClick={onOpenAI} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-2.5 text-sm text-white">
          <Brain className="h-4 w-4" />
          Generer un quiz IA
        </button>
      </div>

      <div className="flex gap-2">
        {["Tous", "Pratique", "Examens", "Revision"].map((label) => (
          <button
            key={label}
            onClick={() => setActiveFilter(label)}
            className={`rounded-xl px-4 py-2 text-sm ${
              activeFilter === label
                ? "bg-[#FF6B00] text-white"
                : "border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <article key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-14 rounded-lg" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
            <div className="mt-4 flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() =>
                  toast({
                    title: "Quiz pret",
                    description: "Le lancement du quiz fonctionnera des que les donnees backend seront connectees.",
                  })
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] py-2.5 text-sm text-white"
              >
                <Play className="h-4 w-4" />
                Commencer
              </button>
              <button
                onClick={() =>
                  toast({
                    title: "Reprise bientot disponible",
                    description: "La reprise d'une tentative sera activee avec l'API des quiz.",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reprendre
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
