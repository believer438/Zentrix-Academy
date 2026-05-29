import { useEffect, useState, useCallback } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, Edit2, Eye, EyeOff,
  GraduationCap, Loader2, Plus, Save, Shield, Trash2, Video, X,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import {
  apiGetCatalogueAllAdmin, apiCreateCourse, apiUpdateCourse, apiDeleteCourse,
  apiGetCourseChapters, apiCreateChapter, apiUpdateChapter, apiDeleteChapter,
  type CatalogueCourse, type BackendChapter,
} from "@/lib/api-client";

const LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
  intermediate: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  advanced: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
};

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  cover_image: string;
  level: string;
  duration_hours: number;
  instructor_name: string;
  is_published: boolean;
  tags: string;
}

const emptyForm = (): CourseFormData => ({
  title: "",
  description: "",
  category: "",
  cover_image: "",
  level: "beginner",
  duration_hours: 0,
  instructor_name: "",
  is_published: true,
  tags: "",
});

interface ChapterFormData {
  title: string;
  description: string;
  content: string;
  order_index: number;
  video_url: string;
  duration_min: number;
}

const emptyChapterForm = (order: number): ChapterFormData => ({
  title: "",
  description: "",
  content: "",
  order_index: order,
  video_url: "",
  duration_min: 0,
});

// ── Chapter Form ──────────────────────────────────────────────────────────────
function ChapterRow({
  chapter, courseId, onUpdated, onDeleted,
}: {
  chapter: BackendChapter;
  courseId: number;
  onUpdated: (ch: BackendChapter) => void;
  onDeleted: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ChapterFormData>({
    title: chapter.title,
    description: chapter.description,
    content: chapter.content,
    order_index: chapter.order_index,
    video_url: chapter.video_url,
    duration_min: chapter.duration_min,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiUpdateChapter(courseId, chapter.id, form);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer le chapitre « ${chapter.title} » ?`)) return;
    setDeleting(true);
    try {
      await apiDeleteChapter(courseId, chapter.id);
      onDeleted(chapter.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  return (
    <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/15 text-[10px] font-bold text-[#FF6B00]">
          {chapter.order_index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{chapter.title}</p>
          {chapter.video_url && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-400">
              <Video className="h-3 w-3 text-[#FF6B00]" />
              {chapter.video_url}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing((v) => !v)} className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-[#FF6B00]">
            {editing ? <ChevronUp className="h-4 w-4" /> : <Edit2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-red-500 disabled:opacity-50">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Titre *">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </FormField>
            <FormField label="URL Vidéo (YouTube ou MP4)">
              <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=…" className={inputCls} />
            </FormField>
            <FormField label="Durée (min)">
              <input type="number" min={0} value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })} className={inputCls} />
            </FormField>
            <FormField label="Ordre">
              <input type="number" min={0} value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} className={inputCls} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Description">
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Contenu (texte du cours, paragraphes séparés par ligne vide)">
                <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={`${inputCls} resize-y`} />
              </FormField>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course Modal ──────────────────────────────────────────────────────────────
function CourseModal({
  course,
  onClose,
  onSaved,
}: {
  course: CatalogueCourse | null;
  onClose: () => void;
  onSaved: (c: CatalogueCourse) => void;
}) {
  const isEdit = course !== null;
  const [form, setForm] = useState<CourseFormData>(course ? {
    title: course.title,
    description: course.description,
    category: course.category,
    cover_image: course.cover_image,
    level: course.level,
    duration_hours: course.duration_hours,
    instructor_name: course.instructor_name,
    is_published: course.is_published,
    tags: course.tags,
  } : emptyForm());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chapter management
  const [chapters, setChapters] = useState<BackendChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterForm, setNewChapterForm] = useState<ChapterFormData>(emptyChapterForm(0));
  const [savingChapter, setSavingChapter] = useState(false);

  useEffect(() => {
    if (!course?.id) return;
    setLoadingChapters(true);
    apiGetCourseChapters(course.id)
      .then(setChapters)
      .catch(() => {})
      .finally(() => setLoadingChapters(false));
  }, [course?.id]);

  const handleSaveCourse = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, duration_hours: Number(form.duration_hours) };
      const saved = isEdit
        ? await apiUpdateCourse(course!.id, payload)
        : await apiCreateCourse(payload);
      onSaved(saved);
      if (!isEdit) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = async () => {
    if (!course?.id || !newChapterForm.title.trim()) return;
    setSavingChapter(true);
    try {
      const ch = await apiCreateChapter(course.id, {
        ...newChapterForm,
        order_index: chapters.length,
        duration_min: Number(newChapterForm.duration_min),
      });
      setChapters((prev) => [...prev, ch]);
      setNewChapterForm(emptyChapterForm(chapters.length + 1));
      setAddingChapter(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingChapter(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? `Modifier : ${course.title}` : "Nouveau cours"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Champs obligatoires marqués *</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
          )}

          {/* Course fields */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Informations du cours</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Titre *">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Introduction à Python" className={inputCls} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Description">
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le contenu et les objectifs du cours" className={`${inputCls} resize-none`} />
                </FormField>
              </div>
              <FormField label="Catégorie">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex : Développement Web" className={inputCls} />
              </FormField>
              <FormField label="Instructeur">
                <input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} placeholder="Nom de l'instructeur" className={inputCls} />
              </FormField>
              <FormField label="Niveau">
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inputCls}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </FormField>
              <FormField label="Durée (heures)">
                <input type="number" min={0} value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} className={inputCls} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Image de couverture (URL)">
                  <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://images.unsplash.com/…" className={inputCls} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Tags (séparés par des virgules)">
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Python, Data, Machine Learning" className={inputCls} />
                </FormField>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  onClick={() => setForm({ ...form, is_published: !form.is_published })}
                  className={`relative h-6 w-11 flex-shrink-0 transition-colors ${form.is_published ? "bg-[#FF6B00]" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 bg-white shadow transition-transform ${form.is_published ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {form.is_published ? "Publié (visible par les étudiants)" : "Brouillon (non visible)"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={onClose} className="border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                Annuler
              </button>
              <button onClick={handleSaveCourse} disabled={saving || !form.title.trim()} className="flex items-center gap-2 bg-[#FF6B00] px-6 py-2 text-sm font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEdit ? "Sauvegarder" : "Créer le cours"}
              </button>
            </div>
          </div>

          {/* Chapters (only for existing courses) */}
          {isEdit && (
            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chapitres ({chapters.length})
                </h3>
                <button
                  onClick={() => setAddingChapter((v) => !v)}
                  className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un chapitre
                </button>
              </div>

              {loadingChapters && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
                </div>
              )}

              {!loadingChapters && chapters.length === 0 && !addingChapter && (
                <div className="border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                  Aucun chapitre. Ajoutez le premier contenu de ce cours.
                </div>
              )}

              <div className="space-y-2">
                {chapters.map((ch) => (
                  <ChapterRow
                    key={ch.id}
                    chapter={ch}
                    courseId={course!.id}
                    onUpdated={(updated) => setChapters((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
                    onDeleted={(id) => setChapters((prev) => prev.filter((c) => c.id !== id))}
                  />
                ))}
              </div>

              {addingChapter && (
                <div className="mt-3 border border-[#FF6B00]/30 bg-orange-50/30 p-4 dark:bg-[#FF6B00]/5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">Nouveau chapitre</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Titre *">
                      <input value={newChapterForm.title} onChange={(e) => setNewChapterForm({ ...newChapterForm, title: e.target.value })} className={inputCls} />
                    </FormField>
                    <FormField label="URL Vidéo (YouTube ou MP4)">
                      <input value={newChapterForm.video_url} onChange={(e) => setNewChapterForm({ ...newChapterForm, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=…" className={inputCls} />
                    </FormField>
                    <FormField label="Durée (min)">
                      <input type="number" min={0} value={newChapterForm.duration_min} onChange={(e) => setNewChapterForm({ ...newChapterForm, duration_min: Number(e.target.value) })} className={inputCls} />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Description">
                        <textarea rows={2} value={newChapterForm.description} onChange={(e) => setNewChapterForm({ ...newChapterForm, description: e.target.value })} className={`${inputCls} resize-none`} />
                      </FormField>
                    </div>
                    <div className="sm:col-span-2">
                      <FormField label="Contenu (paragraphes séparés par ligne vide)">
                        <textarea rows={5} value={newChapterForm.content} onChange={(e) => setNewChapterForm({ ...newChapterForm, content: e.target.value })} className={`${inputCls} resize-y`} />
                      </FormField>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => setAddingChapter(false)} className="border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Annuler</button>
                    <button onClick={handleAddChapter} disabled={savingChapter || !newChapterForm.title.trim()} className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
                      {savingChapter ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      Ajouter
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls = "w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [courses, setCourses] = useState<CatalogueCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalCourse, setModalCourse] = useState<CatalogueCourse | null | "new">(undefined as unknown as null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadCourses = useCallback(() => {
    setLoading(true);
    setError(null);
    apiGetCatalogueAllAdmin()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDelete = async (course: CatalogueCourse) => {
    if (!confirm(`Supprimer définitivement « ${course.title} » et tous ses chapitres ?`)) return;
    setDeletingId(course.id);
    try {
      await apiDeleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = (saved: CatalogueCourse) => {
    setCourses((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      if (exists) return prev.map((c) => c.id === saved.id ? saved : c);
      return [saved, ...prev];
    });
    if (modalCourse === null) {
      setModalCourse(saved);
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    drafts: courses.filter((c) => !c.is_published).length,
    totalEnrolled: courses.reduce((s, c) => s + c.enrolled_count, 0),
  };

  return (
    <div className="w-full min-h-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Administration"
        title="Gestion des cours"
        subtitle="Créez, modifiez et publiez les cours de la plateforme. Ajoutez des chapitres avec vidéos et contenu."
        backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=600&fit=crop"
        icon={<Shield className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total cours", value: stats.total, color: "text-slate-900 dark:text-white" },
            { label: "Publiés", value: stats.published, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Brouillons", value: stats.drafts, color: "text-amber-600 dark:text-amber-400" },
            { label: "Inscriptions totales", value: stats.totalEnrolled, color: "text-[#FF6B00]" },
          ].map((s) => (
            <div key={s.label} className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catalogue des cours</h2>
          <button
            onClick={() => { setModalCourse(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e56000]"
          >
            <Plus className="h-4 w-4" />
            Nouveau cours
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center justify-between border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <span>{error}</span>
            <button onClick={loadCourses} className="text-xs font-semibold underline">Réessayer</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
          </div>
        )}

        {/* Course list */}
        {!loading && courses.length === 0 && !error && (
          <div className="border border-dashed border-slate-300 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-950">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucun cours. Créez le premier cours de la plateforme.</p>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                {/* Cover */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${LEVEL_COLORS[course.level] ?? LEVEL_COLORS.beginner}`}>
                      {course.level}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${course.is_published ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                      {course.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">{course.category || "Général"}</p>
                  <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{course.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{course.instructor_name || "—"}</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.chapters?.length ?? 0} chapitres</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setModalCourse(course); setShowModal(true); }}
                      className="flex flex-1 items-center justify-center gap-1.5 border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      disabled={deletingId === course.id}
                      className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 disabled:opacity-50 dark:border-slate-700"
                    >
                      {deletingId === course.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CourseModal
          course={modalCourse as CatalogueCourse | null}
          onClose={() => { setShowModal(false); setModalCourse(null as unknown as null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
