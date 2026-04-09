import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "eduplatform_session";
const FIRST_VISIT_PANEL_KEY = "zentrix_first_visit_auth_panel_seen";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createSessionAndContinue = () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        fullName,
        email,
        createdAt: new Date().toISOString(),
        provider: "password",
      })
    );
    localStorage.setItem(FIRST_VISIT_PANEL_KEY, "1");
    navigate("/courses");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createSessionAndContinue();
  };

  return (
    <div className="min-h-full bg-[#0b0d14] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Inscription</p>
        <h1 className="mt-3 text-3xl font-black">Creer un compte</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400"
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#06131a] transition-colors hover:bg-cyan-400"
          >
            Creer mon compte
          </button>
        </form>
      </div>
    </div>
  );
}
