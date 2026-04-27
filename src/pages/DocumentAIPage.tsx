import { useMemo, useState } from "react";
import { CheckCircle2, FileText, FileUp, LoaderCircle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";

type RunState = "idle" | "loading" | "ready";

const options = [
  { id: "explain", label: "Expliquer clairement le document" },
  { id: "quiz", label: "Créer un questionnaire complet" },
  { id: "logic", label: "Fournir une explication logique" },
];

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  pedagogy: string[];
  questions: { question: string; answer: string }[];
}

function buildAnalysis(title: string): AnalysisResult {
  const subject = title.trim() || "votre document";
  return {
    summary: `Ce document aborde « ${subject} » en combinant fondations théoriques et exemples concrets. Il est organisé en plusieurs parties qui progressent du contexte général vers les techniques spécialisées, ce qui en fait un excellent support pour une étude structurée.`,
    keyPoints: [
      "Définit clairement le vocabulaire et les concepts centraux dès l'introduction.",
      "Articule les notions autour d'études de cas et de schémas explicatifs.",
      "Propose une montée en complexité régulière, accessible aux apprenants intermédiaires.",
      "Conclut par une synthèse réutilisable et des pistes d'approfondissement.",
    ],
    pedagogy: [
      "Lire l'introduction et la conclusion en premier pour cartographier le contenu.",
      "Annoter les définitions clés et les illustrer avec un exemple personnel.",
      "Reformuler chaque chapitre avec ses propres mots pour ancrer la mémorisation.",
      "Programmer une révision espacée à 24h, 7 jours puis 30 jours.",
    ],
    questions: [
      {
        question: `Quels sont les concepts essentiels à retenir de « ${subject} » ?`,
        answer:
          "Les notions centrales sont introduites dès le premier chapitre : terminologie, cadre méthodologique et contraintes principales. Elles forment le socle sur lequel reposent les chapitres suivants.",
      },
      {
        question: "Quelles parties faut-il réviser en priorité ?",
        answer:
          "Concentrez-vous d'abord sur les chapitres présentant les fondations conceptuelles, puis sur les sections d'application pratique. Les annexes peuvent être consultées à la demande.",
      },
      {
        question: "Comment vérifier que la matière est bien acquise ?",
        answer:
          "Réalisez un mini-examen blanc à partir des questions posées en fin de chapitre, puis expliquez les points difficiles à voix haute, comme si vous enseigniez à quelqu'un d'autre.",
      },
    ],
  };
}

export default function DocumentAIPage() {
  const { toast } = useToast();
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["explain"]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const hasSelection = useMemo(() => selectedOptions.length > 0, [selectedOptions]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    if (!selectedFile) {
      toast({
        title: "Ajoutez un document",
        description: "Importez d'abord un livre ou un document.",
      });
      return;
    }

    if (!hasSelection) {
      toast({
        title: "Choisissez une action",
        description: "Cochez au moins une action pour l'IA.",
      });
      return;
    }

    setRunState("loading");

    window.setTimeout(() => {
      setAnalysis(buildAnalysis(documentTitle || selectedFile.name.replace(/\.[^.]+$/, "")));
      setRunState("ready");
    }, 1400);
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
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Titre du document</label>
              <input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Ex : Analyse mathématique"
                className="w-full rounded-none border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#FF6B00] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Fichier</label>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-none border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-[#FF6B00] hover:bg-orange-50/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-[#FF6B00] dark:hover:bg-orange-950/20">
                <FileUp className="h-5 w-5" />
                <span className="text-center">{selectedFile ? selectedFile.name : "Choisir un fichier PDF, DOCX ou TXT"}</span>
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

            <div className="rounded-none border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ce que l'IA doit faire</p>
              <div className="mt-4 space-y-3">
                {options.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
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
                className="min-h-[120px] rounded-none border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleLaunch}
              className="flex w-full items-center justify-center gap-2 rounded-none bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {runState === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Lancer l'analyse
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
                  Importez un document, choisissez les actions à effectuer, puis lancez l'analyse.
                </div>
              )}

              {runState === "loading" && (
                <div className="flex items-center gap-3 rounded-none border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <LoaderCircle className="h-5 w-5 animate-spin text-[#FF6B00]" />
                  L'IA analyse votre document, un instant…
                </div>
              )}

              {runState === "ready" && analysis && (
                <div className="space-y-4">
                  <article className="rounded-none bg-white p-5 dark:bg-slate-950">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Résumé général</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{analysis.summary}</p>
                  </article>

                  <article className="rounded-none bg-white p-5 dark:bg-slate-950">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Points clés à retenir</h3>
                    <ul className="mt-3 space-y-2">
                      {analysis.keyPoints.map((point) => (
                        <li key={point} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF6B00]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-none bg-white p-5 dark:bg-slate-950">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Méthode d'étude conseillée</h3>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                      {analysis.pedagogy.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </article>
                </div>
              )}
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Questions & réponses</h2>

              {runState === "idle" && (
                <div className="rounded-none bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Les questions générées à partir du document apparaîtront ici.
                </div>
              )}

              {runState === "loading" && (
                <div className="rounded-none bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Préparation des questions…
                </div>
              )}

              {runState === "ready" && analysis && (
                <Accordion type="single" collapsible className="w-full">
                  {analysis.questions.map((qa, index) => (
                    <AccordionItem key={qa.question} value={`item-${index}`} className="border-slate-200 dark:border-slate-800">
                      <AccordionTrigger className="text-left text-sm font-medium text-slate-800 hover:no-underline dark:text-slate-100">
                        {qa.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="rounded-none bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          {qa.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
