import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Chrome, Eye, EyeOff, Loader2, ArrowLeft, BookOpen, Users, TrendingUp, Shield } from "lucide-react";
import { apiLogin, apiRegister, setToken, isAuthenticated } from "@/lib/api-client";

type Mode = "login" | "register";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const testimonials = [
  { name: "Sarah M.", role: "Étudiante en Data Science", avatar: "SM", text: "Zentrix a transformé ma façon d'apprendre. L'IA m'aide à progresser deux fois plus vite." },
  { name: "Karim B.", role: "Développeur Web", avatar: "KB", text: "Les cours sont structurés, clairs et l'assistant IA répond à toutes mes questions en temps réel." },
  { name: "Amina T.", role: "Marketing Digital", avatar: "AT", text: "La meilleure plateforme d'apprentissage que j'ai utilisée. Simple, professionnelle et efficace." },
];

const stats = [
  { icon: BookOpen, value: "20+", label: "Parcours" },
  { icon: Users, value: "5 000+", label: "Apprenants" },
  { icon: TrendingUp, value: "95%", label: "Satisfaction" },
  { icon: Shield, value: "100%", label: "Gratuit" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>(
    (searchParams.get("mode") as Mode) ?? "login"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(id);
  }, []);

  const switchMode = (m: Mode) => { setMode(m); setError(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        if (!fullName.trim()) { setError("Le nom complet est requis."); setLoading(false); return; }
        if (password.length < 8) { setError("Le mot de passe doit faire au moins 8 caractères."); setLoading(false); return; }
        await apiRegister(email, fullName.trim(), password);
        const res = await apiLogin(email, password);
        setToken(res.access_token);
      } else {
        const res = await apiLogin(email, password);
        setToken(res.access_token);
      }
      localStorage.setItem("zentrix-academy_session", JSON.stringify({ email, createdAt: new Date().toISOString() }));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const t = testimonials[testimonialIdx];

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* ── Left panel (branding) ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col bg-[#0a0a14] overflow-hidden">
        {/* gradient blobs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#FF6B00]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#FF6B00]/10 blur-3xl" />

        {/* top */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/zentrix.avif" alt="Zentrix" className="h-10 w-10 object-contain" />
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">Zentrix Academy</span>
          </Link>
        </div>

        {/* center content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 pb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00] mb-4">
            Plateforme d'apprentissage IA
          </p>
          <h1 className="text-4xl font-black text-white leading-[1.15] mb-6">
            Apprenez plus vite.<br />
            <span className="text-[#FF6B00]">Progressez</span> plus loin.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Des parcours structurés, un assistant IA disponible 24/7 et un tableau de bord personnalisé pour suivre votre progression.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <Icon className="mx-auto mb-2 h-5 w-5 text-[#FF6B00]" />
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-500">
            <p className="text-sm text-slate-300 italic leading-relaxed">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB347] to-[#FF6B00] text-xs font-bold text-white">
                {initials(t.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* dots */}
        <div className="relative z-10 flex justify-center gap-2 pb-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === testimonialIdx ? "w-6 bg-[#FF6B00]" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <img src="/zentrix.avif" alt="Zentrix" className="h-8 w-8 object-contain" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Zentrix Academy</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Back link (desktop) */}
            <Link to="/" className="mb-8 hidden lg:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === "login" ? "Bon retour 👋" : "Créez votre compte"}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {mode === "login"
                  ? "Connectez-vous pour accéder à votre espace d'apprentissage."
                  : "Rejoignez Zentrix Academy et commencez à apprendre aujourd'hui."}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="mt-8 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Marie Dupont"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Minimum 8 caractères" : "Votre mot de passe"}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "register" && password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => {
                      let score = 0;
                      if (password.length >= 8) score++;
                      if (/[A-Z]/.test(password)) score++;
                      if (/[0-9]/.test(password)) score++;
                      if (/[^A-Za-z0-9]/.test(password)) score++;
                      const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
                      return (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score - 1] : "bg-slate-200 dark:bg-slate-700"}`} />
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#FF6B00] py-3.5 text-sm font-bold text-white transition hover:bg-[#e56000] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</>
                ) : mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>

              {/* Google OAuth placeholder */}
              <button
                type="button"
                onClick={() => { window.location.href = "/auth/google/login"; }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 flex items-center justify-center gap-2.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Chrome className="h-4 w-4" />
                Continuer avec Google
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="font-bold text-[#FF6B00] hover:underline"
              >
                {mode === "login" ? "S'inscrire gratuitement" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
