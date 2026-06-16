import { useCallback, useEffect, useRef, useState } from "react";
import { toast as toastSonner } from "sonner";
import { ConfirmDialog, CONFIRM_CLOSED, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { useSetPageContext } from "@/hooks/usePageContext";
import {
  BookOpen, Check, CheckCircle, Clock,
  Edit2, Eye, EyeOff, FileText, GraduationCap,
  Loader2, Maximize2, Plus, RefreshCw, Save, Search, Shield,
  SlidersHorizontal, Sparkles, Trash2, UserCheck, Users, Video, X,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import PageHero from "@/components/ui/PageHero";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  type CatalogueCourse,
  apiEnrollCourse, apiGetCatalogue,
  apiGetCatalogueAllAdmin, apiGetCatalogueCategories, apiUnenrollCourse,
  apiCreateCourse, apiUpdateCourse, apiDeleteCourse,
  apiGetCourseChapters, apiCreateChapter, apiUpdateChapter, apiDeleteChapter,
  isAuthenticated,
} from "@/lib/api-client";
import type { BackendChapter } from "@/lib/api-client";
import type { Course } from "@/lib/backend-types";

interface CoursesPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  isAdmin?: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner:     "Débutant",
  intermediate: "Intermédiaire",
  advanced:     "Avancé",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
  intermediate: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  advanced:     "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
};

const ALL_LEVELS = ["beginner", "intermediate", "advanced"];

const LEVELS = [
  { value: "beginner",     label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced",     label: "Avancé" },
];

const inputCls = "w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors";

function catalogueToCourse(c: CatalogueCourse): Course {
  return {
    id:                `cat-${c.id}`,
    backendId:         c.id,
    title:             c.title,
    description:       c.description,
    coverImage:        c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
    categoryId:        `cat-${c.category}`,
    categoryName:      c.category || "Général",
    professor:         c.instructor_name || "Zentrix Academy",
    difficulty:        c.level as Course["difficulty"],
    estimatedDuration: c.duration_hours,
    chaptersCount:     c.chapters?.length ?? 0,
    lessonsCount:      c.chapters?.length ?? 0,
    enrolledCount:     c.enrolled_count,
    progress:          0,
    isEnrolled:        c.is_enrolled,
    isFeatured:        c.is_published,
    tags:              c.tags ? c.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
  };
}

// ── Admin helpers ─────────────────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

interface ChapterFormData {
  title: string; description: string; content: string;
  order_index: number; video_url: string; duration_min: number;
}
const emptyChapterForm = (order: number): ChapterFormData => ({
  title: "", description: "", content: "", order_index: order, video_url: "", duration_min: 0,
});

function ChapterRow({ chapter, courseId, onUpdated, onDeleted }: {
  chapter: BackendChapter; courseId: number;
  onUpdated: (ch: BackendChapter) => void; onDeleted: (id: number) => void;
}) {
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ChapterFormData>({
    title: chapter.title, description: chapter.description, content: chapter.content,
    order_index: chapter.order_index, video_url: chapter.video_url, duration_min: chapter.duration_min,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { const u = await apiUpdateChapter(courseId, chapter.id, form); onUpdated(u); setEditing(false); }
    catch (err) { toastSonner.error(err instanceof Error ? err.message : "Erreur"); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setConfirmOpen(false);
    try { await apiDeleteChapter(courseId, chapter.id); onDeleted(chapter.id); }
    catch (err) { toastSonner.error(err instanceof Error ? err.message : "Erreur"); }
  };

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      title={`Supprimer le chapitre ?`}
      description={`« ${chapter.title} » sera définitivement supprimé.`}
      confirmLabel="Supprimer"
      onConfirm={doDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    {editorOpen && (
      <RichTextEditor
        value={form.content}
        onChange={html => setForm(prev => ({ ...prev, content: html }))}
        onClose={() => setEditorOpen(false)}
        chapterTitle={form.title || chapter.title}
      />
    )}
    <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 rounded-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/15 text-[10px] font-bold text-[#FF6B00]">
          {chapter.order_index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{chapter.title}</p>
          {chapter.video_url && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-400">
              <Video className="h-3 w-3 text-[#FF6B00]" />{chapter.video_url}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing(v => !v)} className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-[#FF6B00] dark:hover:bg-slate-800">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setConfirmOpen(true)} className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {editing && (
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Titre *"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></FormField>
            <FormField label="URL Vidéo"><input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/…" className={inputCls} /></FormField>
            <FormField label="Durée (min)"><input type="number" min={0} value={form.duration_min} onChange={e => setForm({ ...form, duration_min: Number(e.target.value) })} className={inputCls} /></FormField>
            <FormField label="Ordre"><input type="number" min={0} value={form.order_index} onChange={e => setForm({ ...form, order_index: Number(e.target.value) })} className={inputCls} /></FormField>
            <div className="sm:col-span-2"><FormField label="Description"><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} /></FormField></div>
            <div className="sm:col-span-2">
              <FormField label="Contenu pédagogique">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    className={`${inputCls} resize-y pr-10`}
                    placeholder="Écrivez ici ou cliquez sur ⛶ pour l'éditeur pleine page…"
                  />
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); setEditorOpen(true); }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] transition-colors"
                    title="Ouvrir l'éditeur pleine page (Word)"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {form.content?.trim().startsWith("<") && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                    <Check className="h-3 w-3" /> Contenu riche (HTML) — sera rendu en pleine mise en forme
                  </p>
                )}
              </FormField>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

interface CourseFormData {
  title: string; description: string; category: string; cover_image: string;
  level: string; duration_hours: number; instructor_name: string;
  is_published: boolean; tags: string;
}
const emptyForm = (): CourseFormData => ({
  title: "", description: "", category: "", cover_image: "", level: "beginner",
  duration_hours: 0, instructor_name: "", is_published: true, tags: "",
});

function CourseModal({ course, onClose, onSaved }: {
  course: CatalogueCourse | null; onClose: () => void; onSaved: (c: CatalogueCourse) => void;
}) {
  const isEdit = course !== null;
  const [form, setForm] = useState<CourseFormData>(course ? {
    title: course.title, description: course.description, category: course.category,
    cover_image: course.cover_image, level: course.level, duration_hours: course.duration_hours,
    instructor_name: course.instructor_name, is_published: course.is_published, tags: course.tags,
  } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<BackendChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [addingChapter, setAddingChapter]         = useState(false);
  const [newChapterForm, setNewChapterForm]       = useState<ChapterFormData>(emptyChapterForm(0));
  const [savingChapter, setSavingChapter]         = useState(false);
  const [newChapterEditorOpen, setNewChapterEditorOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!course?.id) return;
    setLoadingChapters(true);
    apiGetCourseChapters(course.id).then(setChapters).catch(() => {}).finally(() => setLoadingChapters(false));
  }, [course?.id]);

  const handleSaveCourse = async () => {
    if (!form.title.trim()) return;
    setSaving(true); setError(null);
    try {
      const payload = { ...form, duration_hours: Number(form.duration_hours) };
      const saved = isEdit ? await apiUpdateCourse(course!.id, payload) : await apiCreateCourse(payload);
      onSaved(saved);
      if (!isEdit) onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  };

  const handleAddChapter = async () => {
    if (!course?.id || !newChapterForm.title.trim()) return;
    setSavingChapter(true);
    try {
      const ch = await apiCreateChapter(course.id, { ...newChapterForm, order_index: chapters.length, duration_min: Number(newChapterForm.duration_min) });
      setChapters(prev => [...prev, ch]);
      setNewChapterForm(emptyChapterForm(chapters.length + 1));
      setAddingChapter(false);
    } catch (err) { toastSonner.error(err instanceof Error ? err.message : "Erreur lors de l'ajout du chapitre"); }
    finally { setSavingChapter(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="my-6 w-full max-w-3xl rounded-sm border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? `Modifier : ${course.title}` : "Nouveau cours"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">Champs obligatoires marqués *</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {error && <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileText className="h-3.5 w-3.5 text-[#FF6B00]" /> Informations du cours
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><FormField label="Titre *"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex : Introduction à Python" className={inputCls} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Description"><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le contenu et les objectifs du cours" className={`${inputCls} resize-none`} /></FormField></div>
              <FormField label="Catégorie"><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex : Développement Web" className={inputCls} /></FormField>
              <FormField label="Instructeur"><input value={form.instructor_name} onChange={e => setForm({ ...form, instructor_name: e.target.value })} placeholder="Nom de l'instructeur" className={inputCls} /></FormField>
              <FormField label="Niveau">
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={inputCls}>
                  {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </FormField>
              <FormField label="Durée (heures)"><input type="number" min={0} value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: Number(e.target.value) })} className={inputCls} /></FormField>
              <div className="sm:col-span-2"><FormField label="Image de couverture (URL)"><input value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} placeholder="https://images.unsplash.com/…" className={inputCls} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Tags (séparés par des virgules)"><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Python, Data, Machine Learning" className={inputCls} /></FormField></div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <button onClick={() => setForm({ ...form, is_published: !form.is_published })} className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${form.is_published ? "bg-[#FF6B00]" : "bg-slate-300 dark:bg-slate-700"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_published ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {form.is_published ? "Publié (visible par les étudiants)" : "Brouillon (non visible)"}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={onClose} className="border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Annuler</button>
              <button onClick={handleSaveCourse} disabled={saving || !form.title.trim()} className="flex items-center gap-2 bg-[#FF6B00] px-6 py-2 text-sm font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEdit ? "Sauvegarder" : "Créer le cours"}
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Video className="h-3.5 w-3.5 text-[#FF6B00]" /> Chapitres ({chapters.length})
                </h3>
                <button onClick={() => setAddingChapter(v => !v)} className="flex items-center gap-1.5 rounded-sm bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000]">
                  <Plus className="h-3.5 w-3.5" /> Ajouter un chapitre
                </button>
              </div>

              {loadingChapters && <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" /></div>}

              {!loadingChapters && chapters.length === 0 && !addingChapter && (
                <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                  Aucun chapitre. Ajoutez le premier contenu de ce cours.
                </div>
              )}

              <div className="space-y-2">
                {chapters.map(ch => (
                  <ChapterRow key={ch.id} chapter={ch} courseId={course!.id}
                    onUpdated={u => setChapters(prev => prev.map(c => c.id === u.id ? u : c))}
                    onDeleted={id => setChapters(prev => prev.filter(c => c.id !== id))}
                  />
                ))}
              </div>

              {newChapterEditorOpen && (
                <RichTextEditor
                  value={newChapterForm.content}
                  onChange={html => setNewChapterForm(prev => ({ ...prev, content: html }))}
                  onClose={() => setNewChapterEditorOpen(false)}
                  chapterTitle={newChapterForm.title || "Nouveau chapitre"}
                />
              )}

              {addingChapter && (
                <div className="mt-3 rounded-sm border border-[#FF6B00]/30 bg-orange-50/30 p-4 dark:bg-[#FF6B00]/5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">Nouveau chapitre</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Titre *"><input value={newChapterForm.title} onChange={e => setNewChapterForm({ ...newChapterForm, title: e.target.value })} className={inputCls} /></FormField>
                    <FormField label="URL Vidéo"><input value={newChapterForm.video_url} onChange={e => setNewChapterForm({ ...newChapterForm, video_url: e.target.value })} placeholder="https://youtube.com/…" className={inputCls} /></FormField>
                    <FormField label="Durée (min)"><input type="number" min={0} value={newChapterForm.duration_min} onChange={e => setNewChapterForm({ ...newChapterForm, duration_min: Number(e.target.value) })} className={inputCls} /></FormField>
                    <div className="sm:col-span-2"><FormField label="Description"><textarea rows={2} value={newChapterForm.description} onChange={e => setNewChapterForm({ ...newChapterForm, description: e.target.value })} className={`${inputCls} resize-none`} /></FormField></div>
                    <div className="sm:col-span-2">
                      <FormField label="Contenu pédagogique">
                        <div className="relative">
                          <textarea
                            rows={4}
                            value={newChapterForm.content}
                            onChange={e => setNewChapterForm({ ...newChapterForm, content: e.target.value })}
                            className={`${inputCls} resize-y pr-10`}
                            placeholder="Écrivez ici ou cliquez sur ⛶ pour l'éditeur pleine page…"
                          />
                          <button
                            type="button"
                            onMouseDown={e => { e.preventDefault(); setNewChapterEditorOpen(true); }}
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] transition-colors"
                            title="Ouvrir l'éditeur pleine page (Word)"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {newChapterForm.content?.trim().startsWith("<") && (
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                            <Check className="h-3 w-3" /> Contenu riche (HTML) — sera rendu en pleine mise en forme
                          </p>
                        )}
                      </FormField>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => setAddingChapter(false)} className="border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Annuler</button>
                    <button onClick={handleAddChapter} disabled={savingChapter || !newChapterForm.title.trim()} className="flex items-center gap-1.5 rounded-sm bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
                      {savingChapter ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton: course card ─────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="h-44 w-full" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-3 w-20" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="mt-1 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({
  course, onView, onEnrollToggle, enrolling,
  isAdmin, onEdit, onDelete, deleting,
}: {
  course: CatalogueCourse;
  onView: () => void;
  onEnrollToggle: () => void;
  enrolling: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const tags = course.tags
    ? course.tags.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="group relative flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div
        className="relative h-44 w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900"
        onClick={onView}
      >
        {course.cover_image ? (
          <img
            src={course.cover_image}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFB347]/20 to-[#FF6B00]/20">
            <BookOpen className="h-14 w-14 text-[#FF6B00]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${LEVEL_COLORS[course.level] ?? LEVEL_COLORS.beginner}`}>
          {LEVEL_LABELS[course.level] ?? course.level}
        </span>

        {/* Published/Draft badge (admin only) */}
        {isAdmin && (
          <span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            course.is_published
              ? "bg-emerald-500 text-white"
              : "bg-slate-700/90 text-slate-200"
          }`}>
            {course.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {course.is_published ? "Publié" : "Brouillon"}
          </span>
        )}

        {/* Enrolled badge (non-admin) */}
        {!isAdmin && course.is_enrolled && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            <UserCheck className="h-3 w-3" />
            Inscrit
          </span>
        )}

        {/* Admin edit/delete overlay */}
        {isAdmin && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={e => { e.stopPropagation(); onEdit?.(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow hover:bg-[#FF6B00] hover:text-white"
              title="Modifier"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete?.(); }}
              disabled={deleting}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow hover:bg-red-500 hover:text-white disabled:opacity-50"
              title="Supprimer"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
          {course.category || "Général"}
        </p>
        <h3
          onClick={onView}
          className="mb-2 line-clamp-2 cursor-pointer text-[15px] font-bold leading-snug text-slate-900 transition-colors hover:text-[#FF6B00] dark:text-white dark:hover:text-[#FF6B00]"
        >
          {course.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {course.description}
        </p>
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-[#FFB347]" />
            {course.instructor_name || "Instructeur"}
          </span>
          {course.duration_hours > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#FFB347]" />
              {course.duration_hours}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[#FFB347]" />
            {course.enrolled_count.toLocaleString("fr-FR")}
          </span>
        </div>
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-2 pt-1">
          <button
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-1.5 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Voir le cours
          </button>
          {isAdmin ? (
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-1.5 border border-[#FF6B00] px-3 py-2 text-xs font-bold text-[#FF6B00] transition-colors hover:bg-[#FF6B00] hover:text-white"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Modifier
            </button>
          ) : (
            <button
              onClick={onEnrollToggle}
              disabled={enrolling}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                course.is_enrolled
                  ? "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
                  : "bg-[#FF6B00] text-white hover:bg-[#e56000]"
              }`}
            >
              {enrolling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : course.is_enrolled ? (
                <UserCheck className="h-3.5 w-3.5" />
              ) : (
                <GraduationCap className="h-3.5 w-3.5" />
              )}
              {course.is_enrolled ? "Inscrit" : "S'inscrire"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({
  categories, selectedCategories, onToggleCategory,
  selectedLevels, onToggleLevel,
  enrolledOnly, onToggleEnrolledOnly,
  onClearAll, filterCount, isAdmin,
}: {
  categories:           string[];
  selectedCategories:   string[];
  onToggleCategory:     (cat: string) => void;
  selectedLevels:       string[];
  onToggleLevel:        (lvl: string) => void;
  enrolledOnly:         boolean;
  onToggleEnrolledOnly: () => void;
  onClearAll:           () => void;
  filterCount:          number;
  isAdmin?:             boolean;
}) {
  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start gap-6">

          {!isAdmin && (
            <div className="flex-shrink-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Statut</p>
              <button
                onClick={onToggleEnrolledOnly}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  enrolledOnly
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                  enrolledOnly ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {enrolledOnly && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                Mes cours inscrits
              </button>
            </div>
          )}

          <div className="flex-shrink-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Niveau</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LEVELS.map(lvl => {
                const active = selectedLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    onClick={() => onToggleLevel(lvl)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                        : "border-slate-200 text-slate-600 hover:border-[#FF6B00]/50 hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {LEVEL_LABELS[lvl]}
                  </button>
                );
              })}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Catégories</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => onToggleCategory(cat)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                          : "border-slate-200 text-slate-600 hover:border-[#FF6B00]/50 hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filterCount > 0 && (
            <div className="flex-shrink-0 self-end pb-0.5">
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar filter (desktop) ──────────────────────────────────────────────────
function SidebarFilter({
  categories, selectedCategories, onToggleCategory,
  selectedLevels, onToggleLevel,
  enrolledOnly, onToggleEnrolledOnly,
  filterCount, onClearAll, isAdmin,
}: FilterBarProps) {
  return (
    <aside className="hidden w-60 flex-shrink-0 lg:block">
      <div className="sticky top-4 overflow-hidden rounded-sm border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#FF6B00]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Filtres</span>
            {filterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </div>
          {filterCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#FF6B00]"
            >
              <X className="h-3 w-3" /> Tout effacer
            </button>
          )}
        </div>

        <div className="space-y-5 p-4">

          {/* ── Niveau ── */}
          <div>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Niveau</p>
            <div className="space-y-1">
              {ALL_LEVELS.map(lvl => {
                const active = selectedLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    onClick={() => onToggleLevel(lvl)}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#FF6B00] text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      active ? "border-white/60 bg-white/20" : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {active && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    {LEVEL_LABELS[lvl]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Statut (non-admin) ── */}
          {!isAdmin && (
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Statut</p>
              <button
                onClick={onToggleEnrolledOnly}
                className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  enrolledOnly
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                  enrolledOnly ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {enrolledOnly && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                Mes cours inscrits
              </button>
            </div>
          )}

          {/* ── Catégories ── */}
          {categories.length > 0 && (
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Catégories
              </p>
              <div className="space-y-1">
                {categories.map(cat => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => onToggleCategory(cat)}
                      className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#FF6B00] text-white"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        active ? "border-white/60 bg-white/20" : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {active && <Check className="h-2.5 w-2.5 text-white" />}
                      </span>
                      <span className="truncate text-left">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  hasFilters, onClear, isMyCourses, onBrowse, isAdmin,
}: {
  hasFilters:  boolean;
  onClear:     () => void;
  isMyCourses?: boolean;
  onBrowse?:   () => void;
  isAdmin?:    boolean;
}) {
  if (isMyCourses && !isAdmin) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
          <GraduationCap className="h-9 w-9 text-[#FF6B00]/60" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Vous n'êtes inscrit à aucun cours</p>
          <p className="text-sm text-slate-500">Explorez le catalogue et inscrivez-vous à votre premier cours.</p>
        </div>
        {onBrowse && (
          <button
            onClick={onBrowse}
            className="flex items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e56000]"
          >
            <BookOpen className="h-4 w-4" />
            Voir tous les cours
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <BookOpen className="h-9 w-9 text-slate-300 dark:text-slate-600" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
          {hasFilters ? "Aucun cours ne correspond à vos filtres" : isAdmin ? "Aucun cours créé" : "Aucun cours disponible"}
        </p>
        <p className="text-sm text-slate-500">
          {hasFilters ? "Essayez d'élargir votre recherche." : isAdmin ? "Créez votre premier cours avec le bouton ci-dessus." : "Un administrateur doit créer des cours."}
        </p>
      </div>
      {hasFilters && (
        <button onClick={onClear} className="flex items-center gap-2 border border-[#FF6B00] px-4 py-2 text-sm font-semibold text-[#FF6B00] hover:bg-[#FF6B00]/5">
          <X className="h-4 w-4" />
          Effacer tous les filtres
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CoursesPage({ onNavigate, isAdmin = false }: CoursesPageProps) {
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<CatalogueCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [tab, setTab]               = useState<"all" | "my">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels]         = useState<string[]>([]);
  const [enrolledOnly, setEnrolledOnly]             = useState(false);
  const [enrollingId, setEnrollingId]               = useState<number | null>(null);

  // Admin state
  const [modal, setModal]           = useState<CatalogueCourse | null | "new">(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const authenticated = isAuthenticated();

  useSetPageContext({
    current_page: "courses",
    page_title:   "Catalogue des cours",
    page_data: {
      tab,
      search_query:           search,
      active_filter_category: selectedCategories[0] ?? null,
      active_filter_level:    selectedLevels[0] ?? null,
      visible_results_count:  allCourses.length,
    },
  });

  const loadCatalogue = useCallback(() => {
    setLoading(true);
    setError(null);
    const fetcher = isAdmin
      ? apiGetCatalogueAllAdmin()
      : apiGetCatalogue({ search: search.trim() || undefined });
    fetcher
      .then(setAllCourses)
      .catch(e => setError(e instanceof Error ? e.message : "Erreur réseau"))
      .finally(() => setLoading(false));
  }, [isAdmin, search]);

  const loadCategories = useCallback(() => {
    apiGetCatalogueCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { loadCatalogue(); loadCategories(); }, [loadCatalogue, loadCategories]);

  const tabFiltered = tab === "my"
    ? allCourses.filter(c => c.is_enrolled)
    : allCourses;

  const filtered = tabFiltered.filter(c => {
    if (search && isAdmin) {
      const q = search.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false;
    }
    if (selectedLevels.length > 0 && !selectedLevels.includes(c.level)) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(c.category)) return false;
    if (enrolledOnly && !c.is_enrolled) return false;
    return true;
  });

  const enrolledCount = allCourses.filter(c => c.is_enrolled).length;
  const filterCount   = selectedCategories.length + selectedLevels.length + (enrolledOnly ? 1 : 0);

  const clearAll = () => { setSelectedCategories([]); setSelectedLevels([]); setEnrolledOnly(false); };
  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleLevel = (lvl: string) =>
    setSelectedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);

  const handleEnrollToggle = async (course: CatalogueCourse) => {
    if (!authenticated) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour vous inscrire à ce cours." });
      return;
    }
    setEnrollingId(course.id);
    try {
      if (course.is_enrolled) await apiUnenrollCourse(course.id);
      else await apiEnrollCourse(course.id);
      setAllCourses(prev =>
        prev.map(c =>
          c.id === course.id
            ? { ...c, is_enrolled: !c.is_enrolled, enrolled_count: c.is_enrolled ? c.enrolled_count - 1 : c.enrolled_count + 1 }
            : c,
        ),
      );
    } catch { } finally {
      setEnrollingId(null);
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CONFIRM_CLOSED);

  const handleDelete = (course: CatalogueCourse) => {
    setConfirmDialog({
      open: true,
      title: "Supprimer ce cours ?",
      description: `« ${course.title} » et tous ses chapitres seront définitivement supprimés.`,
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        setConfirmDialog(CONFIRM_CLOSED);
        setDeletingId(course.id);
        try {
          await apiDeleteCourse(course.id);
          setAllCourses(prev => prev.filter(c => c.id !== course.id));
        } catch (e) {
          toastSonner.error(e instanceof Error ? e.message : "Erreur lors de la suppression");
          setDeletingId(null);
        }
      },
    });
  };

  const handleView = (course: CatalogueCourse) =>
    onNavigate("course-detail", catalogueToCourse(course));

  const heroSubtitle = isAdmin
    ? "Mode administration — tous les cours (publiés et brouillons). Créez, modifiez et gérez le contenu pédagogique."
    : "Découvrez tous les cours créés par notre équipe pédagogique. Inscrivez-vous et commencez à apprendre.";

  return (
    <div className="w-full min-h-full bg-[#f4f6fb] dark:bg-slate-950">
      <PageHero
        eyebrow={isAdmin ? "Administration" : "Zentrix Academy"}
        title="Catalogue des cours"
        subtitle={heroSubtitle}
        backgroundImage="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=600&fit=crop"
        icon={isAdmin ? <Shield className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
      />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">

          {/* Tab switcher */}
          {!isAdmin && (
            <div className="flex flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setTab("all")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === "all"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Tous les cours
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === "all" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                  {allCourses.length}
                </span>
              </button>
              <button
                onClick={() => setTab("my")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === "my"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Mes cours
                {enrolledCount > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === "my" ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"}`}>
                    {enrolledCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 rounded-lg bg-[#FF6B00]/10 px-3 py-2 text-sm font-bold text-[#FF6B00]">
              <Shield className="h-4 w-4" />
              Mode admin — {allCourses.length} cours au total
            </div>
          )}

          {/* Search bar */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") setSearch(searchInput); }}
              placeholder="Rechercher un cours, instructeur, catégorie…"
              className="w-full border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSearch(searchInput)}
            className="hidden items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e56000] sm:flex"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>

          <button
            onClick={loadCatalogue}
            className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-500 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700"
            title="Rafraîchir"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 border px-3 py-2.5 text-sm font-semibold transition-colors ${
              filterOpen || filterCount > 0
                ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                : "border-slate-200 text-slate-600 hover:border-[#FF6B00]/50 hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {filterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>

          {/* Admin: create course button */}
          {isAdmin && (
            <button
              onClick={() => onNavigate("create-course")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FFB347] to-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouveau cours
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile filter panel (lg:hidden) ─────────────────────────────────── */}
      {filterOpen && (
        <div className="lg:hidden">
          <FilterBar
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            selectedLevels={selectedLevels}
            onToggleLevel={toggleLevel}
            enrolledOnly={enrolledOnly}
            onToggleEnrolledOnly={() => setEnrolledOnly(v => !v)}
            onClearAll={clearAll}
            filterCount={filterCount}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* ── Content: sidebar + grille ─────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">

        {/* Sidebar filtre (desktop uniquement) */}
        <SidebarFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          selectedLevels={selectedLevels}
          onToggleLevel={toggleLevel}
          enrolledOnly={enrolledOnly}
          onToggleEnrolledOnly={() => setEnrolledOnly(v => !v)}
          onClearAll={clearAll}
          filterCount={filterCount}
          isAdmin={isAdmin}
        />

        {/* Grille des cours */}
        <div className="min-w-0 flex-1">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasFilters={filterCount > 0}
              onClear={clearAll}
              isMyCourses={tab === "my"}
              onBrowse={() => setTab("all")}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={() => handleView(course)}
                  onEnrollToggle={() => handleEnrollToggle(course)}
                  enrolling={enrollingId === course.id}
                  isAdmin={isAdmin}
                  onEdit={() => onNavigate("edit-course", course)}
                  onDelete={() => handleDelete(course)}
                  deleting={deletingId === course.id}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <p className="mt-8 text-center text-xs text-slate-400">
              {filtered.length} cours affiché{filtered.length > 1 ? "s" : ""}
              {filterCount > 0 ? " (filtres actifs)" : ""}
            </p>
          )}
        </div>
      </div>

      {/* ── Course Modal (admin) ─────────────────────────────────────────────── */}
      {modal && (
        <CourseModal
          course={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={saved => {
            setAllCourses(prev => {
              const idx = prev.findIndex(c => c.id === saved.id);
              return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
            });
            setModal(saved);
          }}
        />
      )}
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(CONFIRM_CLOSED)} />
    </div>
  );
}
