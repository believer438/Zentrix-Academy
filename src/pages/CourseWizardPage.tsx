import { useState, useEffect, useCallback } from "react";
import { useSetPageContext } from "@/hooks/usePageContext";
import { toast } from "sonner";
import { ConfirmDialog, CONFIRM_CLOSED, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { useLocation } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2,
  ChevronUp, ChevronDown, Clock, Eye, EyeOff, FileText, GraduationCap,
  Layers, Loader2, Plus, Save, Sparkles, Tag, Trash2, User, Video, X,
} from "lucide-react";
import {
  apiCreateCourse, apiUpdateCourse,
  apiGetCourseChapters, apiCreateChapter, apiUpdateChapter, apiDeleteChapter,
  apiAIChat,
} from "@/lib/api-client";
import type { CatalogueCourse, BackendChapter } from "@/lib/api-client";
import AICourseGenView from "@/pages/AICourseGenView";

const cls = "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-sm placeholder:text-slate-400";

const LEVELS = [
  { value: "beginner",     label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced",     label: "Avancé" },
];

const CATEGORIES = [
  "Développement Web", "Data Science", "Intelligence Artificielle",
  "Cybersécurité", "DevOps", "Mobile", "Design UX/UI", "Mathématiques",
  "Finance", "Marketing Digital", "Langues", "Autre",
];

// ── Types ────────────────────────────────────────────────────────────────────

interface CourseForm {
  title: string; description: string; category: string; cover_image: string;
  level: string; duration_hours: number; instructor_name: string;
  is_published: boolean; tags: string;
}

interface ChapterForm {
  title: string; description: string; content: string;
  video_url: string; duration_min: number; order_index: number;
}

type StepKind = "info" | "chapters" | "chapter" | "review";
interface WizardStep { kind: StepKind; chapterIdx?: number }

const emptyC = (): CourseForm => ({
  title: "", description: "", category: "", cover_image: "",
  level: "beginner", duration_hours: 0, instructor_name: "", is_published: false, tags: "",
});

const emptyCh = (order: number): ChapterForm => ({
  title: "", description: "", content: "", video_url: "", duration_min: 30, order_index: order,
});

function courseToForm(c: CatalogueCourse): CourseForm {
  return {
    title: c.title, description: c.description, category: c.category,
    cover_image: c.cover_image, level: c.level, duration_hours: c.duration_hours,
    instructor_name: c.instructor_name, is_published: c.is_published, tags: c.tags,
  };
}

function chapterToForm(ch: BackendChapter): ChapterForm {
  return {
    title: ch.title, description: ch.description, content: ch.content,
    video_url: ch.video_url, duration_min: ch.duration_min, order_index: ch.order_index,
  };
}

// ── Reusable UI ───────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}{required && <span className="ml-0.5 text-[#FF6B00]"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function AIBtn({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 rounded border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "Génération IA…" : label}
    </button>
  );
}

function ErrorBanner({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss}><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Step 1: Course Info ───────────────────────────────────────────────────────

function StepInfo({ form, setForm, onNext, onBack, saving }: {
  form: CourseForm; setForm: (f: CourseForm) => void;
  onNext: () => void; onBack: () => void; saving: boolean;
}) {
  const [aiLoading, setAiLoading] = useState<"desc" | "tags" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const aiGenerate = async (kind: "desc" | "tags") => {
    if (!form.title.trim()) { setError("Entrez d'abord un titre avant de générer."); return; }
    setAiLoading(kind); setError(null);
    try {
      const prompt = kind === "desc"
        ? `Tu es un expert pédagogique. Rédige une description professionnelle et engageante pour un cours intitulé "${form.title}"${form.category ? ` (catégorie : ${form.category})` : ""}${form.level ? `, niveau ${form.level}` : ""}. 2-3 paragraphes : objectifs, compétences acquises, public cible. Style clair et motivant. Réponds directement sans titre ni introduction.`
        : `Pour un cours "${form.title}"${form.category ? ` (${form.category})` : ""}, donne 6 à 8 tags pertinents séparés par des virgules. Réponds uniquement avec les tags.`;
      const res = await apiAIChat(prompt, undefined, [], "assistant");
      if (kind === "desc") setForm({ ...form, description: res.reply.trim() });
      else setForm({ ...form, tags: res.reply.replace(/\n/g, "").trim() });
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur IA"); }
    finally { setAiLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10">
          <FileText className="h-5 w-5 text-[#FF6B00]" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Informations générales</h2>
          <p className="text-xs text-slate-500">Titre, description, catégorie et détails visibles dans le catalogue.</p>
        </div>
      </div>

      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Titre du cours" required>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Maîtriser React 18 avec TypeScript" className={cls} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Description <span className="font-normal text-slate-400">(public)</span>
            </label>
            <AIBtn onClick={() => aiGenerate("desc")} loading={aiLoading === "desc"} label="Générer avec l'IA" />
          </div>
          <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez les objectifs, compétences acquises et le public cible…"
            className={`${cls} resize-none leading-relaxed`} />
        </div>

        <div className="relative">
          <Field label="Catégorie">
            <div className="relative">
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                onFocus={() => setCatOpen(true)} onBlur={() => setTimeout(() => setCatOpen(false), 150)}
                placeholder="Ex : Développement Web…" className={cls} />
              {catOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-sm border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  {CATEGORIES.filter(c => !form.category || c.toLowerCase().includes(form.category.toLowerCase()))
                    .map(cat => (
                      <button key={cat} type="button"
                        onMouseDown={() => setForm({ ...form, category: cat })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                        <Tag className="h-3.5 w-3.5 text-slate-400" /> {cat}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </Field>
        </div>

        <Field label="Instructeur">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.instructor_name} onChange={e => setForm({ ...form, instructor_name: e.target.value })}
              placeholder="Nom et prénom de l'instructeur" className={`${cls} pl-9`} />
          </div>
        </Field>

        <Field label="Niveau d'apprentissage">
          <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={cls}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </Field>

        <Field label="Durée totale (heures)" hint="Estimation pour l'apprenant">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="number" min={0} step={0.5} value={form.duration_hours}
              onChange={e => setForm({ ...form, duration_hours: Number(e.target.value) })} className={`${cls} pl-9`} />
          </div>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Image de couverture (URL)" hint="Recommandé : 1280×720 px, format JPEG ou WebP">
            <input value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })}
              placeholder="https://images.unsplash.com/photo-…" className={cls} />
          </Field>
          {form.cover_image && (
            <div className="mt-2 flex gap-3">
              <div className="h-20 w-36 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700">
                <img src={form.cover_image} alt="" className="h-full w-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">Aperçu de l'image de couverture.</p>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</label>
            <AIBtn onClick={() => aiGenerate("tags")} loading={aiLoading === "tags"} label="Suggérer des tags" />
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="Python, Data Science, Machine Learning, Débutant…" className={`${cls} pl-9`} />
          </div>
          {form.tags && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="rounded-full bg-[#FF6B00]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#FF6B00]">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800/50">
          <button type="button" onClick={() => setForm({ ...form, is_published: !form.is_published })}
            className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors ${form.is_published ? "bg-[#FF6B00]" : "bg-slate-300 dark:bg-slate-600"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_published ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {form.is_published
                ? <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-emerald-500" /> Cours publié</span>
                : <span className="flex items-center gap-1.5"><EyeOff className="h-4 w-4 text-slate-400" /> Brouillon</span>}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {form.is_published ? "Visible par tous les étudiants dans le catalogue." : "Visible uniquement en mode administrateur. Vous pourrez publier plus tard."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Annuler
        </button>
        <button onClick={onNext} disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 bg-[#FF6B00] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer et gérer les chapitres
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Chapters Overview ─────────────────────────────────────────────────

function ChapterCard({ ch, idx, total, onUp, onDown, onDelete, onEdit }: {
  ch: BackendChapter; idx: number; total: number;
  onUp: () => void; onDown: () => void; onDelete: () => void; onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#FF6B00]/30 dark:border-slate-700 dark:bg-slate-800/50">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/10 text-xs font-black text-[#FF6B00]">{idx + 1}</span>
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onEdit}>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{ch.title || <span className="italic text-slate-400">Sans titre</span>}</p>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-400">
          {ch.duration_min > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ch.duration_min} min</span>}
          {ch.video_url && <span className="flex items-center gap-1"><Video className="h-3 w-3 text-[#FF6B00]" />Vidéo</span>}
          {ch.content && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{ch.content.length} caractères</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00]">
          <FileText className="h-3.5 w-3.5" />
        </button>
        <div className="flex flex-col">
          <button onClick={onUp} disabled={idx === 0} className="flex h-4 w-6 items-center justify-center rounded text-slate-300 hover:text-slate-600 disabled:opacity-30 dark:text-slate-600 dark:hover:text-slate-300">
            <ChevronUp className="h-3 w-3" />
          </button>
          <button onClick={onDown} disabled={idx === total - 1} className="flex h-4 w-6 items-center justify-center rounded text-slate-300 hover:text-slate-600 disabled:opacity-30 dark:text-slate-600 dark:hover:text-slate-300">
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepChapters({ courseId, chapters, setChapters, onEditChapter, onNext, onBack }: {
  courseId: number; chapters: BackendChapter[]; setChapters: (c: BackendChapter[]) => void;
  onEditChapter: (idx: number) => void; onNext: () => void; onBack: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTitles, setAiTitles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true); setError(null);
    try {
      const ch = await apiCreateChapter(courseId, { title: newTitle, description: "", content: "", video_url: "", duration_min: 30, order_index: chapters.length });
      setChapters([...chapters, ch]);
      setNewTitle(""); setAdding(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur lors de l'ajout"); }
    finally { setSaving(false); }
  };

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CONFIRM_CLOSED);

  const handleDelete = (ch: BackendChapter) => {
    setConfirmDialog({
      open: true,
      title: `Supprimer le chapitre ?`,
      description: `« ${ch.title || "sans titre"} » sera définitivement supprimé.`,
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        setConfirmDialog(CONFIRM_CLOSED);
        try {
          await apiDeleteChapter(courseId, ch.id);
          setChapters(chapters.filter(c => c.id !== ch.id));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Erreur lors de la suppression");
          setError(e instanceof Error ? e.message : "Erreur");
        }
      },
    });
  };

  const handleReorder = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    const updated = [...chapters];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((ch, i) => { ch.order_index = i; });
    setChapters(updated);
    try {
      await Promise.all([
        apiUpdateChapter(courseId, updated[idx].id, { order_index: updated[idx].order_index }),
        apiUpdateChapter(courseId, updated[newIdx].id, { order_index: updated[newIdx].order_index }),
      ]);
    } catch {}
  };

  const suggestChapters = async () => {
    setAiLoading(true); setAiTitles([]); setError(null);
    try {
      const res = await apiAIChat(
        `Propose un plan de cours structuré pour un cours dont les chapitres existants sont : ${chapters.map((c, i) => `${i + 1}. ${c.title}`).join(", ") || "aucun pour l'instant"}. Donne 5 à 8 titres de chapitres supplémentaires ou complémentaires, un par ligne, sous forme de liste numérotée. Réponds uniquement avec la liste.`,
        undefined, [], "assistant",
      );
      const lines = res.reply.split("\n").filter(Boolean)
        .map(l => l.replace(/^\d+[\.\)]\s*/, "").trim()).filter(Boolean);
      setAiTitles(lines);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur IA"); }
    finally { setAiLoading(false); }
  };

  const addAiTitle = async (title: string) => {
    setSaving(true);
    try {
      const ch = await apiCreateChapter(courseId, { title, description: "", content: "", video_url: "", duration_min: 30, order_index: chapters.length });
      setChapters([...chapters, ch]);
      setAiTitles(prev => prev.filter(t => t !== title));
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-900/20">
          <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Structure des chapitres</h2>
          <p className="text-xs text-slate-500">Ajoutez, ordonnez et gérez les chapitres. Chaque chapitre sera édité en détail ensuite.</p>
        </div>
        <div className="ml-auto">
          <AIBtn onClick={suggestChapters} loading={aiLoading} label="Suggestions IA" />
        </div>
      </div>

      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      {aiTitles.length > 0 && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-400">
            <Sparkles className="h-3.5 w-3.5" /> Suggestions de l'IA — cliquez pour ajouter
          </p>
          <div className="flex flex-wrap gap-2">
            {aiTitles.map(t => (
              <button key={t} onClick={() => addAiTitle(t)} disabled={saving}
                className="flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                <Plus className="h-3 w-3" /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {chapters.length === 0 && !adding && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Aucun chapitre pour l'instant</p>
            <p className="mt-1 text-xs text-slate-400">Ajoutez le premier chapitre ou utilisez l'IA pour suggérer une structure.</p>
          </div>
        )}
        {chapters.map((ch, i) => (
          <ChapterCard key={ch.id} ch={ch} idx={i} total={chapters.length}
            onUp={() => handleReorder(i, -1)} onDown={() => handleReorder(i, 1)}
            onDelete={() => handleDelete(ch)} onEdit={() => onEditChapter(i)}
          />
        ))}
      </div>

      {adding ? (
        <div className="rounded-xl border border-[#FF6B00]/30 bg-orange-50/50 p-4 dark:bg-[#FF6B00]/5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">Nouveau chapitre</p>
          <div className="flex gap-2">
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
              placeholder="Titre du chapitre…" className={`${cls} flex-1`} />
            <button onClick={handleAdd} disabled={saving || !newTitle.trim()}
              className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ajouter
            </button>
            <button onClick={() => { setAdding(false); setNewTitle(""); }}
              className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-400 transition hover:border-[#FF6B00]/50 hover:text-[#FF6B00] dark:border-slate-700">
          <Plus className="h-4 w-4" /> Ajouter un chapitre
        </button>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Informations du cours
        </button>
        <button onClick={onNext}
          className="flex items-center gap-2 bg-[#FF6B00] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#e56000]">
          {chapters.length > 0 ? `Éditer les ${chapters.length} chapitres` : "Passer au récapitulatif"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(CONFIRM_CLOSED)} />
    </div>
  );
}

// ── Step 3+: Chapter Editor ───────────────────────────────────────────────────

function StepChapterEditor({ ch, idx, total, courseId, onSaved, onBack, onNext }: {
  ch: BackendChapter; idx: number; total: number; courseId: number;
  onSaved: (updated: BackendChapter) => void; onBack: () => void; onNext: () => void;
}) {
  const [form, setForm] = useState<ChapterForm>(chapterToForm(ch));
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<"desc" | "content" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(chapterToForm(ch));
    setSaved(false);
  }, [ch.id]);

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Le titre du chapitre est requis."); return; }
    setSaving(true); setError(null);
    try {
      const updated = await apiUpdateChapter(courseId, ch.id, {
        title: form.title, description: form.description, content: form.content,
        video_url: form.video_url, duration_min: Number(form.duration_min), order_index: form.order_index,
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de sauvegarde"); }
    finally { setSaving(false); }
  };

  const aiGenerate = async (kind: "desc" | "content") => {
    if (!form.title.trim()) { setError("Entrez d'abord un titre de chapitre."); return; }
    setAiLoading(kind); setError(null);
    try {
      const prompt = kind === "desc"
        ? `Génère une description courte et engageante (2-3 phrases) pour un chapitre de cours intitulé "${form.title}"${form.description ? "" : ". Ce chapitre fait partie d'un cours en ligne."}. Réponds directement sans titre.`
        : `Tu es un expert pédagogique. Génère le contenu détaillé d'un chapitre de cours intitulé "${form.title}"${form.description ? `\nDescription : ${form.description}` : ""}. Structure le contenu avec des sous-titres (##), des explications claires, des exemples concrets et des points clés. Format Markdown. Réponds directement sans introduction.`;
      const res = await apiAIChat(prompt, undefined, [], "assistant");
      if (kind === "desc") setForm(f => ({ ...f, description: res.reply.trim() }));
      else setForm(f => ({ ...f, content: res.reply.trim() }));
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur IA"); }
    finally { setAiLoading(null); }
  };

  const isYouTube = (url: string) => url && (url.includes("youtube.com") || url.includes("youtu.be"));

  const ytEmbed = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 text-sm font-black text-[#FF6B00]">{idx + 1}</span>
        <div className="flex-1">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Chapitre {idx + 1} <span className="font-normal text-slate-400">/ {total}</span>
          </h2>
          <p className="text-xs text-slate-500">Titre, description, contenu et ressource vidéo.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sauvegardé
          </span>
        )}
      </div>

      {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Titre du chapitre" required>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Les fondamentaux de Python" className={cls} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description courte</label>
            <AIBtn onClick={() => aiGenerate("desc")} loading={aiLoading === "desc"} label="Générer" />
          </div>
          <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Résumé de ce que l'apprenant va apprendre dans ce chapitre…"
            className={`${cls} resize-none`} />
        </div>

        <Field label="URL Vidéo" hint="YouTube, Vimeo ou tout hébergeur vidéo">
          <div className="relative">
            <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=…" className={`${cls} pl-9`} />
          </div>
          {isYouTube(form.video_url) && ytEmbed(form.video_url) && (
            <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-black dark:border-slate-700">
              <iframe src={ytEmbed(form.video_url)!} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Aperçu vidéo" />
            </div>
          )}
        </Field>

        <Field label="Durée (minutes)">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="number" min={0} value={form.duration_min} onChange={e => setForm({ ...form, duration_min: Number(e.target.value) })}
              className={`${cls} pl-9`} />
          </div>
        </Field>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Contenu pédagogique <span className="font-normal text-slate-400">(Markdown supporté)</span>
            </label>
            <AIBtn onClick={() => aiGenerate("content")} loading={aiLoading === "content"} label="Générer le contenu" />
          </div>
          <textarea rows={14} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder={`# Titre principal\n\n## Introduction\n\nExpliquez le concept ici...\n\n## Points clés\n\n- Point 1\n- Point 2\n- Point 3\n\n## Exemple pratique\n\n\`\`\`python\nprint("Hello, World!")\n\`\`\``}
            className={`${cls} resize-y font-mono text-xs leading-relaxed`} />
          <p className="mt-1 text-[11px] text-slate-400">
            {form.content.length} caractères · environ {Math.ceil(form.content.length / 800)} min de lecture
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {idx === 0 ? "Retour aux chapitres" : `Chapitre ${idx}`}
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 border border-[#FF6B00] px-5 py-2 text-sm font-bold text-[#FF6B00] hover:bg-[#FF6B00]/5 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sauvegarder
          </button>
          <button onClick={() => { handleSave().then(onNext); }}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 bg-[#FF6B00] px-6 py-2 text-sm font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {idx === total - 1 ? "Sauvegarder et voir le récap" : `Chapitre ${idx + 2}`}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step Final: Review ────────────────────────────────────────────────────────

function StepReview({ course, chapters, onPublishToggle, publishing, onBack, onDone }: {
  course: CatalogueCourse; chapters: BackendChapter[];
  onPublishToggle: () => void; publishing: boolean;
  onBack: () => void; onDone: () => void;
}) {
  const totalDuration = chapters.reduce((acc, ch) => acc + (ch.duration_min || 0), 0);
  const chaptersWithContent = chapters.filter(ch => ch.content.trim().length > 50).length;
  const chaptersWithVideo = chapters.filter(ch => ch.video_url.trim()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Récapitulatif & Publication</h2>
          <p className="text-xs text-slate-500">Vérifiez votre cours avant de le publier.</p>
        </div>
      </div>

      {/* Course preview card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
        {course.cover_image && (
          <div className="h-40 w-full overflow-hidden bg-slate-200">
            <img src={course.cover_image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{course.title}</h3>
              {course.description && <p className="mt-2 line-clamp-3 text-sm text-slate-500">{course.description}</p>}
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${course.is_published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
              {course.is_published ? "Publié" : "Brouillon"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            {course.category && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{course.category}</span>}
            {course.instructor_name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{course.instructor_name}</span>}
            {course.level && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{course.level}</span>}
            {totalDuration > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(totalDuration / 60 * 10) / 10}h de contenu</span>}
          </div>
          {course.tags && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {course.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="rounded-full bg-[#FF6B00]/10 px-2 py-0.5 text-[11px] font-medium text-[#FF6B00]">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chapter stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Chapitres", value: chapters.length, icon: Layers, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Avec contenu", value: chaptersWithContent, icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Avec vidéo", value: chaptersWithVideo, icon: Video, color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10" },
          { label: "Durée totale", value: `${totalDuration}m`, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 ${s.bg}`}>
            <s.icon className={`h-5 w-5 flex-shrink-0 ${s.color}`} />
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chapters list mini */}
      {chapters.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chapitres ({chapters.length})</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {chapters.map((ch, i) => (
              <div key={ch.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/10 text-[10px] font-black text-[#FF6B00]">{i + 1}</span>
                <p className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">{ch.title || <em className="text-slate-400">Sans titre</em>}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {ch.video_url && <Video className="h-3 w-3 text-[#FF6B00]" />}
                  {ch.duration_min > 0 && <span>{ch.duration_min}m</span>}
                  {ch.content.length > 50 ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertCircle className="h-3 w-3 text-amber-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish action */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {course.is_published ? "Cours actuellement publié" : "Publier le cours"}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {course.is_published
                ? "Les étudiants peuvent accéder à ce cours. Vous pouvez le dépublier."
                : "Publiez pour rendre le cours visible dans le catalogue."}
            </p>
          </div>
          <button onClick={onPublishToggle} disabled={publishing}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-50 ${course.is_published ? "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : course.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {publishing ? "…" : course.is_published ? "Dépublier" : "Publier maintenant"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {chapters.length > 0 ? `Chapitre ${chapters.length}` : "Chapitres"}
        </button>
        <button onClick={onDone} className="flex items-center gap-2 bg-[#FF6B00] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#e56000]">
          <Check className="h-4 w-4" /> Terminer
        </button>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, totalChapters }: { step: WizardStep; totalChapters: number }) {
  const steps = [
    { kind: "info",     label: "Infos",    Icon: FileText },
    { kind: "chapters", label: "Structure", Icon: Layers },
    ...Array.from({ length: totalChapters }, (_, i) => ({
      kind: "chapter" as const, label: `Ch. ${i + 1}`, Icon: BookOpen, chapterIdx: i,
    })),
    { kind: "review", label: "Récap", Icon: CheckCircle2 },
  ];

  const currentIdx =
    step.kind === "info"     ? 0 :
    step.kind === "chapters" ? 1 :
    step.kind === "chapter"  ? 2 + (step.chapterIdx ?? 0) :
    steps.length - 1;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const visible = steps.length <= 8 || i === 0 || i === steps.length - 1 || Math.abs(i - currentIdx) <= 1;
          if (!visible) {
            if (i === 1 && currentIdx > 2) return null;
            if (i === steps.length - 2 && currentIdx < steps.length - 3) return null;
          }
          return (
            <div key={`${s.kind}-${"chapterIdx" in s ? (s as { chapterIdx: number }).chapterIdx : 0}`} className="flex items-center">
              {i > 0 && <div className={`h-px w-4 flex-shrink-0 sm:w-8 ${done ? "bg-[#FF6B00]" : "bg-slate-200 dark:bg-slate-700"}`} />}
              <div className={`flex flex-shrink-0 flex-col items-center ${active ? "opacity-100" : done ? "opacity-80" : "opacity-40"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${active ? "bg-[#FF6B00] text-white ring-4 ring-[#FF6B00]/20" : done ? "bg-[#FF6B00] text-white" : "border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800"}`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <s.Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={`mt-1 hidden text-[10px] font-semibold sm:block ${active ? "text-[#FF6B00]" : done ? "text-slate-500" : "text-slate-400"}`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mode Selector ─────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }: { onSelect: (mode: "manual" | "ai") => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10">
          <Brain className="h-5 w-5 text-[#FF6B00]" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">Créer un nouveau cours</h2>
          <p className="text-xs text-slate-500">Choisissez comment vous souhaitez construire votre cours.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Manual */}
        <button
          onClick={() => onSelect("manual")}
          className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#FF6B00] hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-[#FF6B00]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-[#FF6B00]/10 dark:bg-slate-700">
            <FileText className="h-6 w-6 text-slate-500 group-hover:text-[#FF6B00]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Créer manuellement</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Saisissez chaque étape vous-même : infos du cours, chapitres, contenu. L'IA peut vous aider à rédiger descriptions et tags.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-[#FF6B00]">
            Commencer <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </button>

        {/* AI from PDF */}
        <button
          onClick={() => onSelect("ai")}
          className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-violet-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:bg-violet-100 dark:bg-violet-900/20">
            <Sparkles className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Générer depuis un PDF
              <span className="ml-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">IA</span>
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Uploadez n'importe quel PDF (même 500+ pages). L'IA lit page par page, crée les chapitres, rédige les résumés et structure le cours automatiquement.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-violet-600">
            Choisir un PDF <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Vous pourrez réviser et modifier tous les contenus générés avant de publier le cours.
      </p>
    </div>
  );
}


// ── Main Wizard ────────────────────────────────────────────────────────────────

export default function CourseWizardPage({ onNavigate }: { onNavigate: (page: string, data?: unknown) => void }) {
  const location = useLocation();
  const editCourse = (location.state as { editCourse?: CatalogueCourse } | null)?.editCourse ?? null;

  // "select" only shown for new courses; edit goes straight to "manual"
  const [mode, setMode] = useState<"select" | "manual" | "ai">(editCourse ? "manual" : "select");

  const [step, setStep] = useState<WizardStep>({ kind: "info" });
  const [courseForm, setCourseForm] = useState<CourseForm>(editCourse ? courseToForm(editCourse) : emptyC());
  const [savedCourse, setSavedCourse] = useState<CatalogueCourse | null>(editCourse);
  const [chapters, setChapters] = useState<BackendChapter[]>(editCourse?.chapters ?? []);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!editCourse) return;
    if (editCourse.chapters?.length) { setChapters(editCourse.chapters); return; }
    setLoadingChapters(true);
    apiGetCourseChapters(editCourse.id)
      .then(setChapters)
      .catch(() => {})
      .finally(() => setLoadingChapters(false));
  }, [editCourse?.id]);

  const handleSaveCourse = useCallback(async () => {
    if (!courseForm.title.trim()) return;
    setSaving(true); setGlobalError(null);
    try {
      const payload = { ...courseForm, duration_hours: Number(courseForm.duration_hours) };
      const saved = savedCourse
        ? await apiUpdateCourse(savedCourse.id, payload)
        : await apiCreateCourse(payload);
      setSavedCourse(saved);
      setStep({ kind: "chapters" });
    } catch (e) { setGlobalError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  }, [courseForm, savedCourse]);

  const handlePublishToggle = async () => {
    if (!savedCourse) return;
    setPublishing(true);
    try {
      const updated = await apiUpdateCourse(savedCourse.id, { is_published: !savedCourse.is_published });
      setSavedCourse(updated);
      setCourseForm(f => ({ ...f, is_published: updated.is_published }));
    } catch (e) { setGlobalError(e instanceof Error ? e.message : "Erreur"); }
    finally { setPublishing(false); }
  };

  const currentChapterIdx = step.kind === "chapter" ? (step.chapterIdx ?? 0) : 0;
  const currentChapter    = step.kind === "chapter" ? chapters[currentChapterIdx] : null;

  useSetPageContext({
    current_page: "course-wizard",
    page_title: editCourse
      ? `Modifier le cours : ${courseForm.title || editCourse.title}`
      : "Créer un nouveau cours",
    page_data: {
      mode,
      step: step.kind,
      course_title: courseForm.title || null,
      course_description: courseForm.description?.slice(0, 200) || null,
      course_category: courseForm.category || null,
      course_level: courseForm.level,
      course_published: courseForm.is_published,
      chapters_count: chapters.length,
      chapters_list: chapters.map((ch, i) => ({ index: i + 1, title: ch.title })),
      current_chapter_index: step.kind === "chapter" ? (step.chapterIdx ?? 0) + 1 : null,
      current_chapter_title: currentChapter?.title ?? null,
      current_chapter_description: currentChapter?.description?.slice(0, 200) ?? null,
      current_chapter_content_preview: currentChapter?.content?.slice(0, 400) ?? null,
      is_editing_existing_course: !!editCourse,
      saved_course_id: savedCourse?.id ?? null,
    },
  });

  // ── AI mode: full-page takeover ──────────────────────────────────────────────
  if (mode === "ai") {
    return (
      <AICourseGenView
        onNavigate={(page) => {
          if (page === "wizard-new") setMode("select");
          else onNavigate(page);
        }}
        onBack={() => setMode("select")}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#f4f6fb] dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <button
            onClick={() => mode === "manual" && !editCourse ? setMode("select") : onNavigate("courses")}
            className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {mode === "manual" && !editCourse ? "Choisir le mode" : "Retour aux cours"}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#FF6B00]" />
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              {editCourse ? `Modifier : ${editCourse.title}` : "Nouveau cours"}
            </h1>
          </div>
          {savedCourse && (
            <span className="ml-auto text-[11px] text-slate-400">ID #{savedCourse.id}</span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {globalError && (
          <div className="mb-6"><ErrorBanner msg={globalError} onDismiss={() => setGlobalError(null)} /></div>
        )}

        {loadingChapters && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement des chapitres…
          </div>
        )}

        {/* Mode selector (shown for new courses before choosing manual) */}
        {mode === "select" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <ModeSelector onSelect={setMode} />
          </div>
        )}

        {/* Manual wizard */}
        {mode === "manual" && (
          <>
            <ProgressBar step={step} totalChapters={chapters.length} />
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              {step.kind === "info" && (
                <StepInfo
                  form={courseForm} setForm={setCourseForm}
                  onNext={handleSaveCourse}
                  onBack={() => editCourse ? onNavigate("courses") : setMode("select")}
                  saving={saving}
                />
              )}
              {step.kind === "chapters" && savedCourse && (
                <StepChapters
                  courseId={savedCourse.id} chapters={chapters} setChapters={setChapters}
                  onEditChapter={idx => setStep({ kind: "chapter", chapterIdx: idx })}
                  onNext={() => {
                    if (chapters.length > 0) setStep({ kind: "chapter", chapterIdx: 0 });
                    else setStep({ kind: "review" });
                  }}
                  onBack={() => setStep({ kind: "info" })}
                />
              )}
              {step.kind === "chapter" && currentChapter && savedCourse && (
                <StepChapterEditor
                  key={currentChapter.id}
                  ch={currentChapter}
                  idx={currentChapterIdx}
                  total={chapters.length}
                  courseId={savedCourse.id}
                  onSaved={updated => setChapters(prev => prev.map(c => c.id === updated.id ? updated : c))}
                  onBack={() => {
                    if (currentChapterIdx === 0) setStep({ kind: "chapters" });
                    else setStep({ kind: "chapter", chapterIdx: currentChapterIdx - 1 });
                  }}
                  onNext={() => {
                    if (currentChapterIdx < chapters.length - 1)
                      setStep({ kind: "chapter", chapterIdx: currentChapterIdx + 1 });
                    else setStep({ kind: "review" });
                  }}
                />
              )}
              {step.kind === "review" && savedCourse && (
                <StepReview
                  course={savedCourse} chapters={chapters}
                  onPublishToggle={handlePublishToggle} publishing={publishing}
                  onBack={() => {
                    if (chapters.length > 0) setStep({ kind: "chapter", chapterIdx: chapters.length - 1 });
                    else setStep({ kind: "chapters" });
                  }}
                  onDone={() => onNavigate("courses")}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
