import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, CONFIRM_CLOSED, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { useSetPageContext } from "@/hooks/usePageContext";
import {
  AlignLeft, BookOpen, Calendar, Check, ChevronLeft, Clock, Loader2,
  Pencil, Plus, Search, StickyNote, Trash2, X, FileText,
} from "lucide-react";
import {
  type BackendNote,
  apiGetNotes, apiCreateNote, apiUpdateNote, apiDeleteNote, isAuthenticated,
} from "@/lib/api-client";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateLong(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

function formatDateShort(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    const d   = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000)     return "À l'instant";
    if (diff < 3_600_000)  return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch { return ""; }
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

// ── Note list item ────────────────────────────────────────────────────────────
function NoteListItem({
  note, active, onClick,
}: { note: BackendNote; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full border-b px-4 py-3 text-left transition-colors ${
        active
          ? "border-b-[#FF6B00]/20 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10"
          : "border-b-slate-100 hover:bg-slate-50 dark:border-b-slate-800 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded ${
          active ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
        }`}>
          <FileText className="h-3 w-3" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold leading-tight ${
            active ? "text-[#FF6B00]" : "text-slate-900 dark:text-white"
          }`}>
            {note.titre || "Sans titre"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            {note.contenu || "Aucun contenu"}
          </p>
          <p className="mt-1.5 text-[10px] text-slate-300 dark:text-slate-600">
            {formatDateShort(note.updated_at)}
          </p>
        </div>
      </div>
    </button>
  );
}

// ── Empty panel ───────────────────────────────────────────────────────────────
function EmptyPanel({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <StickyNote className="h-9 w-9 text-slate-300 dark:text-slate-600" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune note sélectionnée</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Sélectionnez une note dans la liste ou créez-en une nouvelle.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e56000] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nouvelle note
      </button>
    </div>
  );
}

// ── Note viewer (read mode) ───────────────────────────────────────────────────
function NoteViewer({
  note, onEdit, onDelete, deleting,
}: {
  note: BackendNote;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const lines = note.contenu?.split("\n") ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="min-w-0 flex-1 pr-4">
          <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">
            {note.titre}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Modifié {formatDateShort(note.updated_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Créé {formatDateShort(note.created_at)}
            </span>
            {note.contenu && (
              <span className="flex items-center gap-1">
                <AlignLeft className="h-3 w-3" />
                {wordCount(note.contenu)} mots
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-red-900/20"
          >
            {deleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {note.contenu ? (
          <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
            {lines.map((line, i) =>
              line.trim() === "" ? (
                <div key={i} className="h-3" />
              ) : (
                <p key={i} className="mb-0 leading-relaxed">{line}</p>
              )
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm italic text-slate-300 dark:text-slate-600">Cette note est vide.</p>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center border-t border-slate-100 px-6 py-2.5 dark:border-slate-800">
        <p className="text-[11px] text-slate-300 dark:text-slate-600">
          {formatDateLong(note.updated_at)}
        </p>
      </div>
    </div>
  );
}

// ── Note editor (controlled) ──────────────────────────────────────────────────
function NoteEditor({
  title,
  content,
  onChangeTitle,
  onChangeContent,
  onSave,
  onCancel,
  saving,
  autoSaveStatus,
  isNew,
}: {
  title: string;
  content: string;
  onChangeTitle: (v: string) => void;
  onChangeContent: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  autoSaveStatus: AutoSaveStatus;
  isNew: boolean;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave(); }}
      className="flex h-full flex-col"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-6 py-3.5 dark:border-slate-800">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <Pencil className="h-4 w-4 text-[#FF6B00]" />
          {isNew ? "Nouvelle note" : "Modifier la note"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex items-center gap-1.5 bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#e56000] disabled:opacity-50"
          >
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Check className="h-3.5 w-3.5" />}
            {isNew ? "Créer" : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 disabled:opacity-50 dark:border-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex-shrink-0 border-b border-slate-100 px-6 py-3 dark:border-slate-800">
        <input
          ref={titleRef}
          value={title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Titre de la note…"
          required
          disabled={saving}
          className="w-full bg-transparent text-lg font-bold text-slate-900 placeholder-slate-300 outline-none disabled:opacity-50 dark:text-white dark:placeholder-slate-600"
        />
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => onChangeContent(e.target.value)}
        placeholder="Commencez à écrire votre note ici…"
        disabled={saving}
        className="min-h-0 flex-1 resize-none bg-transparent px-6 py-5 text-sm leading-relaxed text-slate-700 placeholder-slate-300 outline-none disabled:opacity-50 dark:text-slate-300 dark:placeholder-slate-600"
      />

      {/* Footer: word count + autosave indicator */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-slate-100 px-6 py-2 dark:border-slate-800">
        <p className="text-[11px] text-slate-300 dark:text-slate-600">
          {wordCount(content)} mots · {content.length} caractères
          {!isNew && (
            <span className="ml-2 text-[10px] text-slate-200 dark:text-slate-700">· Ctrl+S pour sauvegarder</span>
          )}
        </p>

        {/* Autosave status — only for existing notes */}
        {!isNew && (
          <div className="flex items-center gap-1 text-[11px]">
            {autoSaveStatus === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                <span className="text-slate-400">Sauvegarde…</span>
              </>
            )}
            {autoSaveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">Sauvegardé</span>
              </>
            )}
            {autoSaveStatus === "error" && (
              <span className="text-red-400">Erreur de sauvegarde</span>
            )}
            {autoSaveStatus === "pending" && (
              <span className="text-slate-300 dark:text-slate-700">Non sauvegardé</span>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes,       setNotes]       = useState<BackendNote[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedId,  setSelectedId]  = useState<number | null>(null);
  const [mode,        setMode]        = useState<"view" | "edit" | "new">("view");
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);
  const [search,      setSearch]      = useState("");
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");

  // Controlled editor state (lifted up from NoteEditor)
  const [editTitle,   setEditTitle]   = useState("");
  const [editContent, setEditContent] = useState("");
  const [isDirty,     setIsDirty]     = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");

  // Refs so doAutoSave always reads the latest values without stale closures
  const editTitleRef   = useRef(editTitle);
  const editContentRef = useRef(editContent);
  const selectedIdRef  = useRef(selectedId);
  const modeRef        = useRef(mode);
  const autoSaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { editTitleRef.current   = editTitle;   }, [editTitle]);
  useEffect(() => { editContentRef.current = editContent; }, [editContent]);
  useEffect(() => { selectedIdRef.current  = selectedId;  }, [selectedId]);
  useEffect(() => { modeRef.current        = mode;        }, [mode]);

  const authenticated = isAuthenticated();

  // Load notes ──────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    if (!authenticated) return;
    setLoading(true);
    setError(null);
    apiGetNotes()
      .then(data => {
        setNotes(data);
        setSelectedId(prev => prev ?? (data.length > 0 ? data[0].id : null));
      })
      .catch(e => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [authenticated]);

  useEffect(() => { load(); }, [load]);

  const selectedNote = notes.find(n => n.id === selectedId) ?? null;

  useSetPageContext({
    current_page: "notes",
    page_title:   "Mes notes",
    page_data: {
      notes_count:          notes.length,
      current_note_id:      selectedNote?.id ?? null,
      current_note_title:   selectedNote?.titre ?? null,
      current_note_excerpt: selectedNote?.contenu?.slice(0, 200) ?? null,
    },
  });

  // Autosave (stable — uses refs, no deps) ──────────────────────────────────
  const doAutoSave = useCallback(async () => {
    const id      = selectedIdRef.current;
    const title   = editTitleRef.current.trim();
    const content = editContentRef.current;
    if (!id || !title) return;
    setAutoSaveStatus("saving");
    try {
      const updated = await apiUpdateNote(id, { titre: title, contenu: content });
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      setIsDirty(false);
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(s => s === "saved" ? "idle" : s), 3000);
    } catch {
      setAutoSaveStatus("error");
    }
  }, []);

  // Ctrl+S handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "edit") return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        void doAutoSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, doAutoSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  // Field change handler with debounced autosave ────────────────────────────
  const handleFieldChange = (field: "title" | "content", value: string) => {
    if (field === "title") setEditTitle(value);
    else setEditContent(value);
    setIsDirty(true);
    if (modeRef.current === "edit") {
      setAutoSaveStatus("pending");
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(doAutoSave, 2500);
    }
  };

  // Enter edit mode ─────────────────────────────────────────────────────────
  const startEdit = (note: BackendNote) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setEditTitle(note.titre);
    setEditContent(note.contenu ?? "");
    setIsDirty(false);
    setAutoSaveStatus("idle");
    setMode("edit");
  };

  // Enter new mode ──────────────────────────────────────────────────────────
  const startNew = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (modeRef.current === "edit" && isDirty) void doAutoSave();
    setEditTitle("");
    setEditContent("");
    setIsDirty(false);
    setAutoSaveStatus("idle");
    setMode("new");
    setSelectedId(null);
    setMobilePanel("detail");
  };

  // Select a note (auto-saves current edit before switching) ────────────────
  const handleSelectNote = async (id: number) => {
    if (modeRef.current === "edit" && isDirty && selectedIdRef.current && id !== selectedIdRef.current) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      await doAutoSave();
    }
    setSelectedId(id);
    setMode("view");
    setMobilePanel("detail");
  };

  // Cancel edit ─────────────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsDirty(false);
    setAutoSaveStatus("idle");
    setMode("view");
  };

  // Cancel new ──────────────────────────────────────────────────────────────
  const handleCancelNew = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsDirty(false);
    setAutoSaveStatus("idle");
    setMode("view");
    if (notes.length > 0 && !selectedId) setSelectedId(notes[0].id);
    setMobilePanel("list");
  };

  // Create note ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const note = await apiCreateNote({ titre: editTitle.trim(), contenu: editContent });
      setNotes(prev => [note, ...prev]);
      setSelectedId(note.id);
      setMode("view");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de création");
    } finally {
      setSaving(false);
    }
  };

  // Manual save (button click) — saves + exits edit mode ────────────────────
  const handleManualSave = async () => {
    if (mode === "new") { await handleCreate(); return; }
    if (!selectedId || !editTitle.trim()) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setAutoSaveStatus("saving");
    try {
      const updated = await apiUpdateNote(selectedId, { titre: editTitle.trim(), contenu: editContent });
      setNotes(prev => prev.map(n => n.id === selectedId ? updated : n));
      setIsDirty(false);
      setAutoSaveStatus("idle");
      setMode("view");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de mise à jour");
      setAutoSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CONFIRM_CLOSED);

  // Delete note ─────────────────────────────────────────────────────────────
  const handleDelete = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Supprimer cette note ?",
      description: "Cette action est irréversible. La note sera définitivement supprimée.",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        setConfirmDialog(CONFIRM_CLOSED);
        setDeletingId(id);
        try {
          await apiDeleteNote(id);
          const remaining = notes.filter(n => n.id !== id);
          setNotes(remaining);
          setSelectedId(remaining.length > 0 ? remaining[0].id : null);
          setMode("view");
          setMobilePanel("list");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Erreur de suppression");
          setError(e instanceof Error ? e.message : "Erreur de suppression");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const filteredNotes = search.trim()
    ? notes.filter(n =>
        n.titre.toLowerCase().includes(search.toLowerCase()) ||
        n.contenu?.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-5 p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
          <StickyNote className="h-9 w-9 text-[#FF6B00]/60" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
            Connectez-vous pour accéder à vos notes
          </p>
          <p className="text-sm text-slate-400">Vos notes personnelles seront disponibles ici.</p>
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] flex-col bg-[#f4f6fb] dark:bg-slate-950">

      {/* Page header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6B00]/10">
            <StickyNote className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Mes Notes</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {loading ? "Chargement…" : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>

      {/* Split layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left panel — note list */}
        <div className={`${mobilePanel === "list" ? "flex" : "hidden"} sm:flex w-full flex-shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:w-72`}>
          {/* Search + new */}
          <div className="flex-shrink-0 border-b border-slate-100 p-3 dark:border-slate-800">
            <div className="relative mb-2.5">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs outline-none transition-colors focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <button
              onClick={startNew}
              className="flex w-full items-center justify-center gap-2 bg-[#FF6B00] py-2 text-xs font-bold text-white transition-colors hover:bg-[#e56000]"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle note
            </button>
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                {search ? (
                  <>
                    <Search className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                    <p className="text-xs text-slate-400">Aucun résultat pour «{search}»</p>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                    <p className="text-xs text-slate-400">Aucune note pour l'instant</p>
                  </>
                )}
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  active={selectedId === note.id && mode !== "new"}
                  onClick={() => void handleSelectNote(note.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel — viewer / editor */}
        <div className={`${mobilePanel === "detail" ? "flex" : "hidden"} sm:flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950`}>
          {/* Mobile back button */}
          <button
            className="sm:hidden flex flex-shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-500 hover:text-[#FF6B00] transition-colors dark:border-slate-800 dark:text-slate-400"
            onClick={() => setMobilePanel("list")}
          >
            <ChevronLeft className="h-4 w-4" />
            Mes notes
          </button>
          <div className="min-h-0 flex-1 overflow-hidden">
            {mode === "new" ? (
              <NoteEditor
                title={editTitle}
                content={editContent}
                onChangeTitle={v => handleFieldChange("title", v)}
                onChangeContent={v => handleFieldChange("content", v)}
                onSave={handleManualSave}
                onCancel={handleCancelNew}
                saving={saving}
                autoSaveStatus={autoSaveStatus}
                isNew={true}
              />
            ) : mode === "edit" && selectedNote ? (
              <NoteEditor
                title={editTitle}
                content={editContent}
                onChangeTitle={v => handleFieldChange("title", v)}
                onChangeContent={v => handleFieldChange("content", v)}
                onSave={handleManualSave}
                onCancel={handleCancelEdit}
                saving={saving}
                autoSaveStatus={autoSaveStatus}
                isNew={false}
              />
            ) : selectedNote ? (
              <NoteViewer
                note={selectedNote}
                onEdit={() => startEdit(selectedNote)}
                onDelete={() => handleDelete(selectedNote.id)}
                deleting={deletingId === selectedNote.id}
              />
            ) : (
              <EmptyPanel onNew={startNew} />
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(CONFIRM_CLOSED)} />
    </div>
  );
}
