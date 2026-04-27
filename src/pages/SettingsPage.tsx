import { useState } from "react";
import { Bell, Globe, Lock, Mail, Moon, Save, Settings as SettingsIcon, User } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 transition-colors ${
        checked ? "bg-[#FF6B00]" : "bg-slate-300 dark:bg-slate-700"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("Sara El Mansouri");
  const [email, setEmail] = useState("sara.elmansouri@example.com");
  const [language, setLanguage] = useState("fr");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [revisionReminders, setRevisionReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const onSave = () => {
    toast({
      title: "Préférences enregistrées",
      description: "Vos modifications ont bien été prises en compte.",
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Mon compte"
        title="Paramètres"
        subtitle="Gérez votre profil, vos préférences d'affichage et la fréquence de vos notifications."
        backgroundImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=600&fit=crop"
        icon={<SettingsIcon className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SettingsCard icon={User} title="Profil" subtitle="Vos informations personnelles affichées sur la plateforme.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nom complet">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </Field>
            <Field label="Adresse email" icon={<Mail className="h-4 w-4 text-slate-400" />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </Field>
            <Field label="Rôle">
              <div className="border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Étudiant
              </div>
            </Field>
            <Field label="Établissement">
              <div className="border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Zentrix Academy
              </div>
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard icon={Globe} title="Préférences" subtitle="Personnalisez l'expérience de la plateforme.">
          <div className="space-y-4">
            <Field label="Langue de l'interface">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </Field>
            <ToggleRow
              icon={<Moon className="h-4 w-4 text-slate-400" />}
              title="Mode sombre"
              description="Passe l'interface dans une teinte plus foncée."
              checked={darkMode}
              onChange={setDarkMode}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Bell} title="Notifications" subtitle="Choisissez les rappels qui vous aident à rester régulier.">
          <div className="space-y-3">
            <ToggleRow
              icon={<Mail className="h-4 w-4 text-slate-400" />}
              title="Notifications par email"
              description="Recevez les annonces importantes dans votre boîte mail."
              checked={emailNotif}
              onChange={setEmailNotif}
            />
            <ToggleRow
              icon={<Bell className="h-4 w-4 text-slate-400" />}
              title="Rappels de révision"
              description="Notification quand une carte est due."
              checked={revisionReminders}
              onChange={setRevisionReminders}
            />
            <ToggleRow
              icon={<Lock className="h-4 w-4 text-slate-400" />}
              title="Rapport hebdomadaire"
              description="Un récapitulatif chaque dimanche soir."
              checked={weeklyReport}
              onChange={setWeeklyReport}
            />
          </div>
        </SettingsCard>

        <button
          onClick={onSave}
          className="inline-flex w-full items-center justify-center gap-2 bg-[#FF6B00] py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#e56000]"
        >
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof SettingsIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="flex items-start gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#FF6B00]/10 text-[#FF6B00]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </label>
      {children}
    </div>
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
    <div className="flex items-center justify-between gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
