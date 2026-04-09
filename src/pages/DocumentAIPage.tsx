import { useMemo, useState } from "react";
import { FileText, FileUp, LoaderCircle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type RunState = "idle" | "loading" | "error";

const options = [
  { id: "explain", label: "Expliquer clairement le document" },
  { id: "quiz", label: "Creer un questionnaire complet" },
  { id: "logic", label: "Fournir une explication logique" },
];

const questionItems = [
  "Quels sont les concepts essentiels du livre ?",
  "Quelles parties doivent etre revisees en premier ?",
  "Quels exercices ou questions peuvent etre poses ?",
];

export default function DocumentAIPage() {
  const { toast } = useToast();
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userRequest, setUserRequest] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["explain"]);
  const [runState, setRunState] = useState<RunState>("idle");

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
      setRunState("error");
    }, 1400);
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document IA</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Importez un livre ou un document et demandez a l'IA le type d'aide dont vous avez besoin.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Titre du document</label>
              <input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Ex: Analyse mathematique"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Fichier</label>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
                <FileUp className="h-5 w-5" />
                <span className="text-center">{selectedFile ? selectedFile.name : "Choisir un fichier PDF, DOCX ou TXT"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] ?? null);
                    setRunState("idle");
                  }}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
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
                Instruction supplementaire
              </label>
              <Textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Ex: explique ce livre comme a un debutant et ajoute 10 questions de revision..."
                className="min-h-[120px] rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleLaunch}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {runState === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Lancer l'analyse
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Explication du document</h2>
              </div>

              {runState === "idle" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  Importez un document, choisissez les actions a effectuer, puis lancez l'analyse.
                </div>
              )}

              {runState === "loading" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-5 dark:bg-slate-950">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                  </div>
                  <div className="rounded-2xl bg-white p-5 dark:bg-slate-950">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-11/12" />
                    <Skeleton className="mt-2 h-4 w-4/5" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                  </div>
                </div>
              )}

              {runState === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                  Verifiez votre connexion puis reessayez.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Questions & reponses</h2>

              {runState === "idle" && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Les questions du document apparaitront ici.
                </div>
              )}

              {runState === "loading" && (
                <Accordion type="single" collapsible className="w-full">
                  {questionItems.map((question, index) => (
                    <AccordionItem key={question} value={`item-${index}`} className="border-slate-200 dark:border-slate-800">
                      <AccordionTrigger className="text-slate-800 hover:no-underline dark:text-slate-100">
                        {question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Assertions</div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {runState === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                  Verifiez votre connexion.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
