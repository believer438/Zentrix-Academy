import { ArrowLeft, Brain, PanelLeftOpen, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type Course } from "@/lib/backend-types";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onOpenAI: () => void;
}

export default function CourseDetail({ course, onBack, onOpenAI }: CourseDetailProps) {
  return (
    <div className="flex h-full bg-white dark:bg-slate-900">
      <aside className="hidden w-[300px] flex-shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <Skeleton className="mb-4 h-24 w-full rounded-xl" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</h2>
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="mt-3 space-y-2 pl-9">
                {[0, 1, 2].map((lesson) => (
                  <div key={lesson} className="flex items-center gap-2">
                    <Play className="h-3 w-3 text-slate-300" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Cours
          </button>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 lg:hidden dark:hover:bg-slate-800">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-400">Cours</p>
            <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{course.title}</h1>
          </div>
          <button onClick={onOpenAI} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm text-white">
            <Brain className="h-4 w-4" />
            IA
          </button>
        </div>

        <div className="w-full space-y-6 px-4 py-6 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Skeleton className="aspect-video w-full rounded-none" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <Skeleton className="h-6 w-48" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
