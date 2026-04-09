export default function SettingsPage() {
  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parametres</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerez ici votre profil et vos preferences.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Profil</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Nom complet</label>
            <input disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900" placeholder="Chargement..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
            <input disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900" placeholder="Chargement..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Role</label>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">Chargement...</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Langue</label>
            <select disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              <option>Chargement...</option>
            </select>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mode sombre</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Interface plus foncee</p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-slate-300">
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Notifications</h2>
        <div className="space-y-4">
          {["Notifications par email", "Rappels de revision"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Preference disponible des le chargement du profil.</p>
              </div>
              <button className="relative h-6 w-11 rounded-full bg-slate-300">
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full rounded-xl bg-[#FF6B00] py-3 text-sm font-medium text-white opacity-70">Sauvegarder</button>
    </div>
  );
}
