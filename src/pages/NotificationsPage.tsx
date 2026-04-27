import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useToast } from "@/hooks/use-toast";
import { mockNotifications } from "@/lib/mock-data";

const TYPE_META: Record<
  string,
  { Icon: typeof Bell; label: string; iconClass: string; ringClass: string }
> = {
  info: {
    Icon: Info,
    label: "Info",
    iconClass: "text-blue-600 dark:text-blue-400",
    ringClass: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20",
  },
  success: {
    Icon: CheckCircle2,
    label: "Succès",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    ringClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
  },
  warning: {
    Icon: AlertTriangle,
    label: "Important",
    iconClass: "text-amber-600 dark:text-amber-400",
    ringClass: "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20",
  },
  reminder: {
    Icon: Clock,
    label: "Rappel",
    iconClass: "text-[#FF6B00]",
    ringClass: "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20",
  },
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [readState, setReadState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockNotifications.map((n) => [n.id, n.isRead])),
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(
    () => mockNotifications.filter((n) => !readState[n.id]).length,
    [readState],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? mockNotifications
        : mockNotifications.filter((n) => !readState[n.id]),
    [filter, readState],
  );

  const markAllRead = () => {
    setReadState(Object.fromEntries(mockNotifications.map((n) => [n.id, true])));
    toast({ title: "Notifications marquées comme lues" });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900">
      <PageHero
        eyebrow="Centre d'alertes"
        title="Notifications"
        subtitle="Restez informé de toutes les nouveautés, des rappels et des résultats importants."
        backgroundImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=600&fit=crop"
        icon={<Bell className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {[
              { key: "all" as const, label: `Toutes (${mockNotifications.length})` },
              { key: "unread" as const, label: `Non lues (${unreadCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter === tab.key
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 bg-[#FF6B00] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#e56000]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        </div>

        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950">
              <Bell className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Vous êtes à jour. Aucune nouvelle notification.
              </p>
            </div>
          )}

          {visible.map((notif) => {
            const meta = TYPE_META[notif.type];
            const Icon = meta.Icon;
            const isRead = readState[notif.id];
            return (
              <article
                key={notif.id}
                onClick={() =>
                  setReadState((prev) => ({ ...prev, [notif.id]: true }))
                }
                className={`group flex cursor-pointer items-start gap-4 border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-950 ${
                  isRead
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-[#FF6B00]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center border ${meta.ringClass}`}
                >
                  <Icon className={`h-4 w-4 ${meta.iconClass}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.iconClass}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatTime(notif.createdAt)}
                    </span>
                    {!isRead && (
                      <span className="ml-1 inline-flex h-2 w-2 bg-[#FF6B00]" />
                    )}
                  </div>
                  <h3
                    className={`mt-1 text-sm font-bold ${
                      isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {notif.message}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
