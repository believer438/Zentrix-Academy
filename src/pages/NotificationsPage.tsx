import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [allRead, setAllRead] = useState(false);
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consultez ici les mises a jour importantes et vos alertes.</p>
        </div>
        <button
          onClick={() => {
            setAllRead(true);
            toast({
              title: "Notifications marquees",
              description: "L'action fonctionne deja cote interface. Le backend finalisera la persistance.",
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
        >
          <Check className="h-4 w-4" />
          Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <article key={item} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mt-1 rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-44" />
                {!allRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              <Skeleton className="mt-3 h-3 w-24" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
