import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Info,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Shield,
  Sun,
  User,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { apiGetMe, apiUpdateMe, clearAuth, isAuthenticated, type UserProfile } from "@/lib/api-client";
import { useNavigate } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "profil" | "apparence" | "securite" | "notifications" | "ia";

interface NotifPrefs {
  email: boolean;
  revision: boolean;
  weekly: boolean;
  newCourse: boolean;
}

interface IAPrefs {
  defaultLevel: "debutant" | "intermediaire" | "avance";
  responseLanguage: "fr" | "en" | "ar";
  proactiveHints: boolean;
}

const NOTIF_KEY = "zentrix-notif-prefs";
const IA_KEY = "zentrix-ia-prefs";
const LANG_KEY = "zentrix-lang";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#FF6B00]" : "bg-slate-200 dark:bg-slate-700"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, description }: { icon: typeof SettingsIcon; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6B00]/10">
        <Icon className="h-5 w-5 text-[#FF6B00]" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#FF6B00] ${props.className ?? ""}`}
    />
  );
}

function ReadonlyField({ value, label }: { value: string; label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {value || label || "—"}
    </div>
  );
}

function SaveButton({ loading, onClick, label = "Enregistrer" }: { loading: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e56000] disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {loading ? "Enregistrement…" : label}
    </button>
  );
}

// ── Theme Picker ──────────────────────────────────────────────────────────────
const THEME_OPTIONS: { id: ThemeMode; label: string; desc: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Clair", desc: "Interface lumineuse", Icon: Sun },
  { id: "dark",  label: "Sombre", desc: "Protège les yeux la nuit", Icon: Moon },
  { id: "system", label: "Automatique", desc: "Suit les réglages de l'OS", Icon: Monitor },
];

function ThemePicker({ theme, setTheme }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEME_OPTIONS.map(({ id, label, desc, Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
              active
                ? "border-[#FF6B00] bg-[#FF6B00]/5 shadow-md shadow-[#FF6B00]/10"
                : "border-slate-200 bg-white hover:border-[#FF6B00]/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-[#FF6B00]/40"
            }`}
          >
            {active && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00]">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                active ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${active ? "text-[#FF6B00]" : "text-slate-800 dark:text-slate-100"}`}>
                {label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Level Picker ──────────────────────────────────────────────────────────────
type Level = "debutant" | "intermediaire" | "avance";
const LEVELS: { id: Level; label: string; desc: string; color: string }[] = [
  { id: "debutant", label: "Débutant", desc: "Explications simples et pas à pas", color: "emerald" },
  { id: "intermediaire", label: "Intermédiaire", desc: "Équilibre clarté et profondeur", color: "blue" },
  { id: "avance", label: "Avancé", desc: "Réponses techniques et détaillées", color: "purple" },
];

function LevelPicker({ level, setLevel }: { level: Level; setLevel: (l: Level) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {LEVELS.map(({ id, label, desc, color }) => {
        const active = level === id;
        const colorMap: Record<string, string> = {
          emerald: active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "",
          blue:    active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "",
          purple:  active ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "",
        };
        const textMap: Record<string, string> = {
          emerald: "text-emerald-600 dark:text-emerald-400",
          blue:    "text-blue-600 dark:text-blue-400",
          purple:  "text-purple-600 dark:text-purple-400",
        };
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLevel(id)}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              active
                ? `${colorMap[color]} shadow-sm`
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {active && (
              <Check className={`absolute right-3 top-3 h-4 w-4 ${textMap[color]}`} />
            )}
            <p className={`text-sm font-bold ${active ? textMap[color] : "text-slate-800 dark:text-slate-100"}`}>
              {label}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/50 dark:bg-slate-950">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supprimer mon compte</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Cette action est <strong>irréversible</strong>. Toutes vos données (cours, notes, progrès, historique IA) seront définitivement supprimées.
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tapez <span className="font-mono text-red-500">SUPPRIMER</span> pour confirmer
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={value !== "SUPPRIMER"}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Password strength ──────────────────────────────────────────────────────────
function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Très faible", color: "bg-red-500" };
  if (score === 2) return { score, label: "Faible", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Moyen", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Fort", color: "bg-emerald-400" };
  return { score, label: "Très fort", color: "bg-emerald-600" };
}

// ── Tab Nav ────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: typeof SettingsIcon }[] = [
  { id: "profil",        label: "Profil",         icon: User },
  { id: "apparence",     label: "Apparence",      icon: Sun },
  { id: "securite",      label: "Sécurité",       icon: Shield },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "ia",            label: "Préférences IA", icon: Bot },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [user, setUser] = useState<UserProfile | null>(null);

  // — Profil fields
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // — Sécurité fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // — Language
  const [language, setLanguage] = useState(() => localStorage.getItem(LANG_KEY) || "fr");

  // — Notifications
  const [notif, setNotif] = useState<NotifPrefs>(() =>
    loadJSON<NotifPrefs>(NOTIF_KEY, { email: true, revision: true, weekly: false, newCourse: true })
  );

  // — IA prefs
  const [iaPrefs, setIAPrefs] = useState<IAPrefs>(() =>
    loadJSON<IAPrefs>(IA_KEY, { defaultLevel: "intermediaire", responseLanguage: "fr", proactiveHints: true })
  );

  // — Delete modal
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    apiGetMe()
      .then((u) => {
        setUser(u);
        setFullName(u.full_name ?? "");
      })
      .catch(() => {});
  }, []);

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    professor: "Professeur",
    student: "Étudiant",
  };

  // — Save profile
  const saveProfile = async () => {
    if (!fullName.trim()) {
      toast({ title: "Nom requis", description: "Le nom ne peut pas être vide.", variant: "destructive" });
      return;
    }
    setSavingProfile(true);
    try {
      await apiUpdateMe({ full_name: fullName.trim() });
      toast({ title: "Profil mis à jour", description: "Votre nom a été enregistré." });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  // — Save password
  const savePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Mot de passe trop court", description: "Minimum 8 caractères.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mots de passe différents", description: "Les deux mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setSavingPwd(true);
    try {
      await apiUpdateMe({ password: newPassword });
      toast({ title: "Mot de passe modifié", description: "Votre mot de passe a bien été mis à jour." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally {
      setSavingPwd(false);
    }
  };

  // — Save notifications
  const saveNotif = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notif));
    toast({ title: "Notifications enregistrées" });
  };

  // — Save language
  const saveLang = () => {
    localStorage.setItem(LANG_KEY, language);
    toast({ title: "Langue enregistrée" });
  };

  // — Save IA prefs
  const saveIA = () => {
    localStorage.setItem(IA_KEY, JSON.stringify(iaPrefs));
    toast({ title: "Préférences IA enregistrées" });
  };

  // — Logout
  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const pwdStrength = passwordStrength(newPassword);
  const initials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950">
      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            clearAuth();
            navigate("/");
          }}
        />
      )}

      <PageHero
        eyebrow="Mon compte"
        title="Paramètres"
        subtitle="Gérez votre profil, l'apparence, la sécurité et vos préférences d'apprentissage."
        backgroundImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=600&fit=crop"
        icon={<SettingsIcon className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ── Sidebar nav ── */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                    activeTab === id
                      ? "bg-[#FF6B00] text-white shadow-sm shadow-[#FF6B00]/30"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {activeTab === id && <ChevronRight className="ml-auto h-3.5 w-3.5 hidden lg:block" />}
                </button>
              ))}
            </nav>

            {/* Session info card — desktop only */}
            {user && (
              <div className="mt-4 hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-sm font-bold text-white">
                  {initials(user.full_name)}
                </div>
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {user.full_name || "Sans nom"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                }`}>
                  {roleLabels[user.role] ?? user.role}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            )}
          </aside>

          {/* ── Content ── */}
          <main className="min-w-0 flex-1 space-y-4">

            {/* ═══════════ PROFIL ═══════════ */}
            {activeTab === "profil" && (
              <>
                <Card>
                  <CardHeader icon={User} title="Profil public" description="Ces informations sont visibles sur la plateforme." />
                  <div className="p-6 space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-xl font-bold text-white shadow-md">
                        {initials(fullName || user?.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {fullName || "Sans nom"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nom complet">
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Votre nom complet"
                        />
                      </Field>
                      <Field label="Adresse email">
                        <ReadonlyField value={user?.email ?? ""} />
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Info className="h-3 w-3" /> L'email ne peut pas être modifié.
                        </p>
                      </Field>
                      <Field label="Rôle">
                        <ReadonlyField value={roleLabels[user?.role ?? ""] ?? (user?.role ?? "")} />
                      </Field>
                      <Field label="Langue de l'interface">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="fr">🇫🇷 Français</option>
                          <option value="en">🇬🇧 English</option>
                          <option value="ar">🇲🇦 العربية</option>
                        </select>
                      </Field>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <SaveButton loading={savingProfile} onClick={saveProfile} label="Enregistrer le profil" />
                      <button
                        type="button"
                        onClick={saveLang}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        Sauvegarder la langue
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Déconnexion mobile */}
                <Card className="lg:hidden">
                  <div className="p-5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </Card>
              </>
            )}

            {/* ═══════════ APPARENCE ═══════════ */}
            {activeTab === "apparence" && (
              <Card>
                <CardHeader icon={Sun} title="Apparence" description="Choisissez le thème qui correspond à vos préférences." />
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Thème de l'interface</h3>
                    <ThemePicker theme={theme} setTheme={setTheme} />
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 dark:bg-slate-900">
                      {resolvedTheme === "dark"
                        ? <Moon className="h-4 w-4 text-[#FF6B00]" />
                        : <Sun className="h-4 w-4 text-[#FF6B00]" />
                      }
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mode actif : <strong className="text-slate-700 dark:text-slate-200">
                          {resolvedTheme === "dark" ? "Sombre" : "Clair"}
                        </strong>
                        {theme === "system" && " (suivant le système)"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div className="flex items-center gap-2 rounded-lg bg-[#FF6B00]/5 border border-[#FF6B00]/20 px-4 py-3">
                      <Info className="h-4 w-4 text-[#FF6B00] shrink-0" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Le thème s'applique instantanément et est sauvegardé automatiquement dans votre navigateur.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* ═══════════ SÉCURITÉ ═══════════ */}
            {activeTab === "securite" && (
              <>
                <Card>
                  <CardHeader icon={Shield} title="Sécurité du compte" description="Modifiez votre mot de passe pour protéger votre compte." />
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nouveau mot de passe">
                        <div className="relative">
                          <Input
                            type={showPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 caractères"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {newPassword && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    i <= pwdStrength.score ? pwdStrength.color : "bg-slate-200 dark:bg-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{pwdStrength.label}</p>
                          </div>
                        )}
                      </Field>
                      <Field label="Confirmer le mot de passe">
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Répétez le mot de passe"
                            className={confirmPassword && confirmPassword !== newPassword ? "border-red-400 focus:border-red-500" : ""}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="mt-1 text-[11px] text-red-500">Les mots de passe ne correspondent pas.</p>
                        )}
                        {confirmPassword && confirmPassword === newPassword && (
                          <p className="mt-1 text-[11px] text-emerald-500 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Correspondance confirmée
                          </p>
                        )}
                      </Field>
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 dark:bg-blue-900/20 dark:border-blue-900/50">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Conseils pour un mot de passe sécurisé :</p>
                      <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                        <li className="flex items-center gap-2">
                          <Check className={`h-3 w-3 ${newPassword.length >= 8 ? "text-emerald-500" : "opacity-30"}`} />
                          Au moins 8 caractères
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className={`h-3 w-3 ${/[A-Z]/.test(newPassword) ? "text-emerald-500" : "opacity-30"}`} />
                          Une lettre majuscule
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className={`h-3 w-3 ${/[0-9]/.test(newPassword) ? "text-emerald-500" : "opacity-30"}`} />
                          Un chiffre
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-500" : "opacity-30"}`} />
                          Un caractère spécial (!@#$%…)
                        </li>
                      </ul>
                    </div>

                    <SaveButton loading={savingPwd} onClick={savePassword} label="Changer le mot de passe" />
                  </div>
                </Card>

                {/* Zone de danger */}
                <Card className="border-red-200 dark:border-red-900/50">
                  <div className="flex items-start gap-4 border-b border-red-100 px-6 py-5 dark:border-red-900/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-red-600 dark:text-red-400">Zone de danger</h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Ces actions sont irréversibles. Agissez avec précaution.</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-red-100 bg-red-50/50 px-4 py-4 dark:border-red-900/30 dark:bg-red-900/10">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Supprimer mon compte</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Supprime définitivement votre compte et toutes vos données.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDelete(true)}
                        className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors dark:border-red-700 dark:text-red-400"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ═══════════ NOTIFICATIONS ═══════════ */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader icon={Bell} title="Notifications" description="Gérez comment et quand vous recevez des alertes." />
                <div className="p-6 space-y-3">
                  <ToggleRow
                    icon={<Mail className="h-4 w-4" />}
                    title="Notifications par email"
                    description="Annonces importantes et mises à jour de cours."
                    checked={notif.email}
                    onChange={(v) => setNotif((p) => ({ ...p, email: v }))}
                  />
                  <ToggleRow
                    icon={<Bell className="h-4 w-4" />}
                    title="Rappels de révision"
                    description="Notification quand une révision est due (fiches)."
                    checked={notif.revision}
                    onChange={(v) => setNotif((p) => ({ ...p, revision: v }))}
                  />
                  <ToggleRow
                    icon={<Globe className="h-4 w-4" />}
                    title="Nouveaux cours disponibles"
                    description="Soyez averti dès qu'un nouveau cours est publié."
                    checked={notif.newCourse}
                    onChange={(v) => setNotif((p) => ({ ...p, newCourse: v }))}
                  />
                  <ToggleRow
                    icon={<Lock className="h-4 w-4" />}
                    title="Rapport hebdomadaire"
                    description="Récapitulatif de votre semaine d'apprentissage chaque dimanche."
                    checked={notif.weekly}
                    onChange={(v) => setNotif((p) => ({ ...p, weekly: v }))}
                  />
                  <div className="pt-3">
                    <SaveButton loading={false} onClick={saveNotif} label="Enregistrer les préférences" />
                  </div>
                </div>
              </Card>
            )}

            {/* ═══════════ IA ═══════════ */}
            {activeTab === "ia" && (
              <Card>
                <CardHeader icon={Bot} title="Préférences IA" description="Personnalisez le comportement de votre assistant Zentrix." />
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Niveau pédagogique par défaut</h3>
                    <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                      L'IA s'adapte automatiquement à votre progression, mais vous pouvez forcer un niveau de départ.
                    </p>
                    <LevelPicker
                      level={iaPrefs.defaultLevel}
                      setLevel={(l) => setIAPrefs((p) => ({ ...p, defaultLevel: l }))}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Langue de réponse de l'IA</h3>
                    <select
                      value={iaPrefs.responseLanguage}
                      onChange={(e) => setIAPrefs((p) => ({ ...p, responseLanguage: e.target.value as IAPrefs["responseLanguage"] }))}
                      className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="fr">🇫🇷 Français</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ar">🇲🇦 العربية</option>
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Comportement</h3>
                    <ToggleRow
                      icon={<Bot className="h-4 w-4" />}
                      title="Conseils proactifs"
                      description="L'IA vous suggère de l'aide si vous restez bloqué sur un chapitre."
                      checked={iaPrefs.proactiveHints}
                      onChange={(v) => setIAPrefs((p) => ({ ...p, proactiveHints: v }))}
                    />
                  </div>

                  <div className="pt-2">
                    <SaveButton loading={false} onClick={saveIA} label="Enregistrer les préférences IA" />
                  </div>
                </div>
              </Card>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
