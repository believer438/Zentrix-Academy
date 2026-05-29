import { useEffect, useState } from "react";
import {
  Calendar, Loader2, Pencil, Plus, Save, StickyNote, Trash2, X,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import {
  Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from "@/components/ui/empty";
import {
  type BackendNote,
  apiGetNotes, apiCreateNote, apiUpdateNote, apiDeleteNote, isAuthenticated,
} from "@/lib/api-client";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface EditorProps {
  initial?: BackendNote | null;
  onSave: (titre: string, contenu: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function NoteEditor({ initial, onSave, onCancel, loading }: EditorProps) {
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [contenu, setContenu] = useState(initial?.contenu ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    await onSave(titre.trim(), contenu);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-none border border-[#FF6B00]/40 bg-orange-50/30 p-4 dark:bg-[#FF6B00]/5 dark:border-[#FF6B00]/20">
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre de la note…"
        required
        disabled={loading}
        className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#FF6B00] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Contenu de la note…"
        rows={6}
        disabled={loading}
        className="w-full resize-y border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#FF6B00] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={loading || !titre.trim()}
          className="flex items-center gap-2 bg-[#FF6B00] px-5 py-2 text-xs font-bold text-white hover:bg-[#e56000] disabled:opacity-50">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {initial ? "Sauvegarder" : "Créer"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex items-center gap-2 border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <X className="h-3.5 w-3.5" />
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const authenticated = isAuthenticated();

  const load = () => {
    if (!authenticated) return;
    setLoading(true);
    setError(null);
    apiGetNotes()
      .then(setNotes)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [authenticated]);

  const handleCreate = async (titre: string, contenu: string) => {
    setCreating(true);
    try {
      const note = await apiCreateNote({ titre, contenu });
      setNotes((prev) => [note, ...prev]);
      setShowCreate(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number, titre: string, contenu: string) => {
    setSavingId(id);
    try {
      const updated = await apiUpdateNote(id, { titre, contenu });
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette note ?")) return;
    setDeletingId(id);
    try {
      await apiDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 bg-white p-4 sm:p-6 dark:bg-slate-900">
      <PageHero
        eyebrow="Mes notes"
        title="Notes personnelles"
        subtitle="Prenez des notes, organisez vos idées et retrouvez-les facilement."
        backgroundImage="https://images.unsplash.com/photo-1517842645767-c639042777db?w=1600&h=600&fit=crop"
        icon={<StickyNote className="h-7 w-7" />}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mes notes</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {authenticated ? `${notes.length} note${notes.length !== 1 ? "s" : ""}` : "Connectez-vous pour accéder à vos notes"}
          </p>
        </div>
        {authenticated && !showCreate && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FF6B00] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#e56000]">
            <Plus className="h-3.5 w-3.5" />
            Nouvelle note
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 text-xs font-semibold underline">OK</button>
        </div>
      )}

      {showCreate && (
        <NoteEditor
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={creating}
        />
      )}

      {!authenticated ? (
        <div className="rounded-none border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <StickyNote className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Connectez-vous pour créer et retrouver vos notes.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[#FF6B00]" />
        </div>
      ) : notes.length === 0 && !showCreate ? (
        <Empty className="border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          <EmptyHeader>
            <EmptyMedia variant="icon"><StickyNote className="h-6 w-6" /></EmptyMedia>
            <EmptyTitle>Aucune note</EmptyTitle>
            <EmptyDescription>Créez votre première note de cours.</EmptyDescription>
          </EmptyHeader>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 flex items-center gap-2 bg-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#e56000]">
            <Plus className="h-4 w-4" />
            Créer une note
          </button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) =>
            editingId === note.id ? (
              <div key={note.id} className="sm:col-span-2 lg:col-span-3">
                <NoteEditor
                  initial={note}
                  onSave={(titre, contenu) => handleUpdate(note.id, titre, contenu)}
                  onCancel={() => setEditingId(null)}
                  loading={savingId === note.id}
                />
              </div>
            ) : (
              <article key={note.id}
                className="flex flex-col border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                <h3 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
                  {note.titre}
                </h3>
                {note.contenu && (
                  <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {note.contenu}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(note.updated_at)}
                </div>
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button onClick={() => setEditingId(note.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-300">
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(note.id)} disabled={deletingId === note.id}
                    className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 disabled:opacity-50 dark:border-slate-700">
                    {deletingId === note.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}
