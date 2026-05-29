import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, FileText, FileUp, HelpCircle, LoaderCircle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";
import {
  apiGenerateQuestions,
  apiSummarizeCours,
  apiUploadCours,
  isAuthenticated,
} from "@/lib/api-client";
import { useAITracking } from "@/hooks/useAITracking";

type RunState = "idle" | "loading" | "ready" | "error";

const options = [
  { id: "explain", label: "Résumer et expliquer le document" },
  { id: "quiz", label: "Créer un questionnaire complet" },
  { id: "logic", label: "Fournir une explication logique" },
];

interface QCMQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation?: string;
}

interface AnalysisResult {
  summary: string;
  questions: string | QCMQuestion[] | null;
}

export default function DocumentAIPage() {
  const { toast } = useToast();
  const location = useLocation();

  const navState = (location.state as { id?: number; titre?: string } | null) ?? null;

  const [documentTitle, setDocumentTitle] = useState(navState?.titre ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["explain", "quiz"]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingCoursId = navState?.id ?? null;
  const authenticated = isAuthenticated();

  // Tell the AI which document the student is viewing — enables context-aware responses
  useAITracking({
    coursId:    existingCoursId ?? undefined,
    courseTitle: navState?.titre ?? "",
  });

  useEffect(() => {
    if (navState?.titre) setDocumentTitle(navState.titre);
  }, [navState?.titre]);

  const hasSelection = useMemo(() => selectedOptions.length > 0, [selectedOptions]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleLaunch = async () => {
    if (!existingCoursId && !selectedFile) {
      toast({
        title: "Ajoutez un document",
        description: "Importez d'abord un document ou choisissez un cours depuis la bibliothèque.",
      });
      return;
    }

    if (!hasSelection) {
      toast({ title: "Choisissez une action", description: "Cochez au moins une action pour l'IA." });
      return;
    }

    if (!authenticated) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour utiliser l'analyse IA.",
        variant: "destructive",
      });
      return;
    }

    setRunState("loading");
    setErrorMsg(null);

    try {
      let coursId = existingCoursId;

      if (!coursId && selectedFile) {
        const uploaded = await apiUploadCours(
          documentTitle || selectedFile.name.replace(/\.[^.]+$/, ""),
          selectedFile,
        );
        coursId = uploaded.cours.id;
      }

      if (!coursId) throw new Error("Impossible de déterminer le document à analyser.");

      const wantSummary = selectedOptions.includes("explain") || selectedOptions.includes("logic");
      const wantQuestions = selectedOptions.includes("quiz");

      const customInstr = userRequest.trim() || undefined;

      const [summaryRes, questionsRes] = await Promise.allSettled([
        wantSummary ? apiSummarizeCours(coursId, customInstr) : Promise.resolve(null),
        wantQuestions ? apiGenerateQuestions(coursId, { customInstruction: customInstr, structured: true }) : Promise.resolve(null),
      ]);

      const summary =
        summaryRes.status === "fulfilled" && summaryRes.value
          ? summaryRes.value.summary
          : summaryRes.status === "rejected"
            ? `Erreur résumé : ${(summaryRes.reason as Error).message}`
            : "";

      const rawQ = questionsRes.status === "fulfilled" && questionsRes.value
        ? questionsRes.value.questions
        : questionsRes.status === "rejected"
          ? `Erreur questions : ${(questionsRes.reason as Error).message}`
          : null;

      const questions = rawQ as AnalysisResult["questions"];

      setAnalysis({ summary, questions });
      setRunState("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue");
      setRunState("error");
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <PageHero
        eyebrow="Assistant IA"
        title="Document IA"
        subtitle="Téléchargez vos documents et laissez l'IA les analyser automatiquement."
        backgroundImage="https://images.unsplash.com/photo-1507842072343-583f20270319?w=1600&h=600&fit=crop"
        icon={<FileUp className="h-8 w-8" />}
      />

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            {existingCoursId ? (
              <div className="rounded-none border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                  Document chargé
                </p>
                <p className="mt-1 text-sm font-medium text-green-800 dark:text-green-300">
                  {documentTitle || `Document #${existingCoursId}`}
                </p>
                <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">
                  Prêt pour l'analyse IA
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Titre du document
                  </label>
                  <input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Ex : Analyse mathématique"
                    className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#FF6B00] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Fichier
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-none border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-[#FF6B00] hover:bg-orange-50/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-[#FF6B00] dark:hover:bg-orange-950/20">
                    <FileUp className="h-5 w-5" />
                    <span className="text-center">
                      {selectedFile ? selectedFile.name : "Choisir un fichier PDF, DOCX ou TXT"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        setSelectedFile(e.target.files?.[0] ?? null);
                        setRunState("idle");
                        setAnalysis(null);
                      }}
                    />
                  </label>
                </div>
              </>
            )}

            <div className="rounded-none border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Ce que l'IA doit faire
              </p>
              <div className="mt-4 space-y-3">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <Checkbox
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Instruction supplémentaire
              </label>
              <Textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Ex : explique ce livre comme à un débutant et ajoute 10 questions de révision…"
                className="min-h-[100px] rounded-none border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {!authenticated && (
              <div className="rounded-none border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                Connectez-vous pour utiliser l'analyse IA avec votre document.
              </div>
            )}

            <button
              onClick={handleLaunch}
              disabled={runState === "loading" || !authenticated}
              className="flex w-full items-center justify-center gap-2 rounded-none bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {runState === "loading" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Lancer l'analyse IA
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-none border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FF6B00]" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Analyse du document</h2>
              </div>

              {runState === "idle" && (
                <div className="rounded-none border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  {existingCoursId
                    ? "Choisissez les actions à effectuer, puis lancez l'analyse."
                    : "Importez un document, choisissez les actions à effectuer, puis lancez l'analyse."}
                </div>
              )}

              {runState === "loading" && (
                <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <LoaderCircle className="h-5 w-5 animate-spin text-[#FF6B00]" />
                  L'IA analyse votre document, un instant…
                </div>
              )}

              {runState === "error" && errorMsg && (
                <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {runState === "ready" && analysis && (
                <div className="space-y-4">
                  {analysis.summary && (
                    <article className="rounded-none bg-white p-5 dark:bg-slate-950">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Résumé et analyse
                      </h3>
                      <div className="mt-3 space-y-1.5">
                        {analysis.summary.split("\n").map((line, i) =>
                          line.trim() ? (
                            <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              {line}
                            </p>
                          ) : (
                            <div key={i} className="h-2" />
                          ),
                        )}
                      </div>
                    </article>
                  )}

                  {userRequest && (
                    <div className="rounded-none border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      <span className="font-semibold text-[#FF6B00]">Instruction prise en compte :</span>{" "}
                      {userRequest}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#FF6B00]" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Questions & révision</h2>
              </div>

              {(runState === "idle" || runState === "error") && (
                <div className="rounded-none bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Les questions générées à partir du document apparaîtront ici.
                </div>
              )}

              {runState === "loading" && (
                <div className="rounded-none bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Préparation des questions…
                </div>
              )}

              {runState === "ready" && analysis?.questions && (
                <div className="space-y-3">
                  {Array.isArray(analysis.questions)
                    ? analysis.questions.map((q, i) => (
                        <div key={i} className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            {i + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {(["A", "B", "C", "D"] as const).map((letter) => (
                              <div key={letter}
                                className={`flex items-start gap-2 px-3 py-2 text-xs ${
                                  q.correct === letter
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                                    : "text-slate-600 dark:text-slate-300"
                                }`}>
                                <span className="font-bold flex-shrink-0">{letter})</span>
                                <span>{q.options[letter]}</span>
                                {q.correct === letter && <CheckCircle2 className="h-3.5 w-3.5 ml-auto flex-shrink-0 text-emerald-500" />}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))
                    : typeof analysis.questions === "string"
                    ? analysis.questions.split("\n").map((line, i) =>
                        line.trim() ? (
                          <div key={i} className={`text-sm leading-relaxed ${
                            line.match(/^\d+\./) || line.match(/^[A-Z]\)/) || line.startsWith("Q")
                              ? "font-medium text-slate-800 dark:text-slate-100"
                              : "text-slate-600 dark:text-slate-300"
                          }`}>{line}</div>
                        ) : <div key={i} className="h-1.5" />
                      )
                    : null}
                </div>
              )}

              {runState === "ready" && !analysis?.questions && (
                <div className="flex items-center gap-2 rounded-none border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Analyse terminée — quiz non demandé.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
