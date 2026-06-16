import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BookOpen, ChevronDown, Clock3, Cloud, Code2,
  Database, GraduationCap, Globe, Monitor, Phone, Search,
  Shield, TrendingUp, Users,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string, data?: unknown) => void;
  onOpenAI?:  () => void;
}

// ─── IntersectionObserver hook — triggers ONCE when element enters view ────────
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Rolling-window reveal: photo slides in from its side within overflow-hidden ─
function PhotoReveal({
  from, delay = 0, children,
}: { from: "left" | "right"; delay?: number; children: React.ReactNode }) {
  const { ref, inView } = useInView(0.05);
  return (
    <div ref={ref} className="overflow-hidden">
      <div style={{
        transform: inView ? "translateX(0)" : from === "left" ? "translateX(-110%)" : "translateX(110%)",
        transition: `transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: "transform",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Smooth fade-in wrapper (opacity + tiny translateY only) ─────────────────
function Fade({
  children,
  className = "",
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right" | "none";
}) {
  const { ref, inView } = useInView();
  const off =
    from === "bottom" ? "translateY(24px)" :
    from === "left"   ? "translateX(-28px)" :
    from === "right"  ? "translateX(28px)" : "none";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        opacity:   inView ? 1 : 0,
        transform: inView ? "none" : off,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Typewriter heading — writes text letter by letter on entry ───────────────
function Typewriter({
  text,
  as: Tag = "h2",
  className = "",
  speed = 36,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const { ref, inView } = useInView(0.12);
  const [shown, setShown]   = useState("");
  const [done, setDone]     = useState(false);
  const started              = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const step = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) window.setTimeout(step, speed);
      else setDone(true);
    };
    window.setTimeout(step, delay * 1000 + speed);
  }, [inView, text, speed, delay]);

  return (
    <div ref={ref}>
      <Tag className={className} style={{ whiteSpace: "pre-line" }}>
        {shown}
        {!done && inView && (
          <span style={{ animation: "blink .7s step-end infinite" }} className="ml-px">|</span>
        )}
      </Tag>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    tag: "Plateforme d'apprentissage continu",
    title: "Montez en\ncompétences.",
    subtitle: "Des parcours structurés, un assistant IA et un espace cours personnalisé — tout en un.",
    img: "/cours.jpg",
  },
  {
    tag: "Apprentissage tout au long de la vie",
    title: "Continuez\nd'apprendre.",
    subtitle: "Bibliothèque active, outils IA intégrés et programmes conçus pour rester en progression.",
    img: "/zati/hero-2.avif",
  },
  {
    tag: "Pratique. Transformateur.",
    title: "Vraies\ncompétences.",
    subtitle: "Une méthode basée sur des projets concrets — conçue pour progresser rapidement.",
    img: "/etudiante.jpg",
  },
];

const STATS = [
  { v: "5 000+", l: "Apprenants actifs",     Icon: Users },
  { v: "20+",    l: "Parcours de formation",  Icon: BookOpen },
  { v: "100%",   l: "Accompagnement",         Icon: Shield },
  { v: "24/7",   l: "Accès plateforme",       Icon: Clock3 },
];

const FAQ_TABS = [
  { id: "students",      label: "Étudiants actuels" },
  { id: "professional",  label: "Cours professionnels" },
  { id: "partners",      label: "Partenaires & donateurs" },
  { id: "international", label: "Étudiants internationaux" },
];

const FAQS: Record<string, string[]> = {
  students: [
    "Comment accéder à mes cours ?",
    "Quel accompagnement est disponible si j'ai besoin d'aide ?",
    "Comment suivre ma progression ?",
    "Y a-t-il des sessions en direct, ou tout est pré-enregistré ?",
    "Que se passe-t-il si je prends du retard ?",
    "Puis-je changer de cours ou de programme ?",
  ],
  professional: [
    "Les programmes sont-ils reconnus par les entreprises ?",
    "Peut-on suivre les cours en dehors des heures de travail ?",
    "Y a-t-il des certifications à la fin du parcours ?",
    "Comment obtenir une facture pour mon employeur ?",
  ],
  partners: [
    "Comment devenir partenaire de Zentrix Academy ?",
    "Quels sont les avantages pour les entreprises partenaires ?",
    "Comment faire un don ou sponsoriser un apprenant ?",
  ],
  international: [
    "Les cours sont-ils disponibles en dehors de l'Afrique ?",
    "Les contenus sont-ils disponibles en anglais ?",
    "Comment s'inscrire depuis l'étranger ?",
  ],
};

const PROGRAMS = [
  { title: "Diplôme en Cybersécurité",          badge: "Programme populaire" },
  { title: "Bootcamp Cloud Computing",            badge: "Nouveau" },
  { title: "Data Science & Machine Learning",     badge: "Populaire" },
];

const TAGS = ["Intelligence Artificielle", "Science des Données", "Tech Bootcamp", "Full Stack", "MERN Stack"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate, onOpenAI }: DashboardProps) {
  const [slide, setSlide]       = useState(0);
  const [faqTab, setFaqTab]     = useState("students");
  const [openFaq, setOpenFaq]   = useState<number | null>(0);
  const [query, setQuery]       = useState("");

  // Hero auto-advance
  useEffect(() => {
    const t = window.setTimeout(() => setSlide(s => (s + 1) % SLIDES.length), 10000);
    return () => clearTimeout(t);
  }, [slide]);

  const s = SLIDES[slide];

  return (
    <>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      <div className="bg-white text-[#0f0f1a]">

        {/* ══════════════════════ 1 · HERO ══════════════════════════════════ */}
        <section
          className="relative flex h-[calc(100vh-85px)] flex-col overflow-hidden bg-[#0a0c15] text-white"
        >
          {/* Background image — clean crossfade, no parallax */}
          {SLIDES.map((sl, i) => (
            <div
              key={sl.img}
              className="absolute inset-0"
              style={{
                opacity: i === slide ? 1 : 0,
                transition: "opacity 1.1s cubic-bezier(0.4,0,0.2,1)",
                willChange: "opacity",
              }}
            >
              <img src={sl.img} alt="" className="h-full w-full object-cover object-center" />
            </div>
          ))}

          {/* Fixed gradient overlay — does NOT move */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060910]/90 via-[#060910]/70 to-[#060910]/25" />

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,107,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,1) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Orange left accent */}
          <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#FF6B00] via-[#FF6B00]/40 to-transparent" />

          {/* Content — text per-element transition, buttons always static */}
          <div className="relative mx-auto flex w-full flex-1 flex-col px-6 pb-10 pt-24 sm:px-10 lg:pb-16 lg:pt-28">

            {/* Per-slide text: each element animates independently */}
            {SLIDES.map((sl, i) => {
              const active = i === slide;
              return (
                <div
                  key={sl.title}
                  className="absolute left-10 right-6 flex flex-col sm:left-14"
                  style={{ pointerEvents: active ? "auto" : "none" }}
                >
                  {/* Tag line */}
                  <div
                    className="flex items-center gap-3"
                    style={{
                      opacity:    active ? 1 : 0,
                      transform:  active ? "none" : "translateY(8px)",
                      transition: active
                        ? "opacity 0.65s 0.04s ease, transform 0.65s 0.04s ease"
                        : "opacity 0.28s ease, transform 0.28s ease",
                    }}
                  >
                    <span className="h-px w-8 bg-[#FF6B00]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#FF6B00]">{sl.tag}</span>
                  </div>

                  {/* Title */}
                  <h1
                    className="mt-5 max-w-[14ch] whitespace-pre-line text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-[3.4rem] lg:text-[4.2rem]"
                    style={{
                      opacity:    active ? 1 : 0,
                      transform:  active ? "none" : "translateY(16px)",
                      transition: active
                        ? "opacity 0.78s 0.16s ease, transform 0.78s 0.16s ease"
                        : "opacity 0.28s ease, transform 0.28s ease",
                    }}
                  >
                    {sl.title}
                  </h1>

                  {/* Subtitle */}
                  <p
                    className="mt-4 max-w-[46ch] text-[15px] leading-7 text-slate-300 sm:text-base"
                    style={{
                      opacity:    active ? 1 : 0,
                      transform:  active ? "none" : "translateY(16px)",
                      transition: active
                        ? "opacity 0.78s 0.30s ease, transform 0.78s 0.30s ease"
                        : "opacity 0.28s ease, transform 0.28s ease",
                    }}
                  >
                    {sl.subtitle}
                  </p>
                </div>
              );
            })}

            {/* Static bottom area — buttons + dots, NO slide transition */}
            <div className="relative ml-4 mt-auto pt-[190px] sm:ml-8 sm:pt-[240px] lg:pt-[210px]">
              {/* Action buttons — always visible, never fade or move */}
              <div className="mb-5 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate("courses")}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#e56000] hover:gap-3 active:scale-95"
                >
                  Voir les cours <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onOpenAI ? onOpenAI() : onNavigate("document-ai")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition-all hover:border-[#FF6B00] hover:text-[#FF6B00]"
                >
                  Assistant IA
                </button>
              </div>

              {/* Slide dots */}
              <div className="flex items-center gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width:      i === slide ? 28 : 10,
                      background: i === slide ? "#FF6B00" : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
                <span className="ml-3 font-mono text-[11px] text-white/35">
                  {String(slide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative border-t border-white/10">
            <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
              {STATS.map(({ v, l, Icon }, i) => (
                <div
                  key={l}
                  className={`flex items-center gap-3 px-5 py-5 ${i % 2 === 0 ? "border-r border-white/10" : i < STATS.length - 1 ? "md:border-r md:border-white/10" : ""}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-[#FF6B00]" />
                  <div>
                    <p className="text-lg font-black text-white">{v}</p>
                    <p className="text-[11px] text-slate-400">{l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ 2 · À PROPOS ══════════════════════════════ */}
        <section
          className="flex min-h-[calc(100vh-85px)] h-auto items-center bg-white py-16 sm:py-20"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-2">

            {/* Photos — 2 photos empilées avec badge et labels */}
            <div className="relative hidden w-[420px] flex-shrink-0 lg:block">

              {/* ── "Zentrix" en haut à gauche ─────────────────────────── */}
              <span className="mb-3 block text-[1.65rem] font-black tracking-tight text-[#0f0f1a]">
                Zentrix
              </span>

              <div className="flex flex-col gap-4">
                {/* Photo principale — grande */}
                <PhotoReveal from="left" delay={0}>
                  <div className="h-[260px] w-full overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="/cours.jpg"
                      alt="Cours en ligne"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </PhotoReveal>

                {/* Photo secondaire — plus petite, décalée à droite */}
                <PhotoReveal from="right" delay={0.18}>
                  <div className="ml-auto h-[180px] w-[300px] overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src="/bibliotheque.jpeg"
                      alt="Bibliothèque Zentrix"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </PhotoReveal>
              </div>

              {/* ── Badge GraduationCap sur le coin bas-gauche de la 1ère photo ── */}
              <div className="absolute left-4 top-[calc(3rem+260px-28px)] z-20 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#FF6B00] shadow-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>

              {/* ── "Academy" en bas à droite ────────────────────────────── */}
              <span className="mt-3 block text-right text-[1.65rem] font-black tracking-tight text-[#FF6B00]">
                Academy
              </span>
            </div>

            {/* Mobile single photo */}
            <div className="block overflow-hidden rounded-xl lg:hidden">
              <img src="/cours.jpg" alt="Zentrix" className="h-56 w-full object-cover" />
            </div>

            {/* Text — right */}
            <Fade from="right" delay={0.08}>
              <div className="mb-5 flex items-center gap-2">
                <img src="/zentrix.avif" alt="Zentrix" className="h-8 w-8 object-contain" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-800">Zentrix Academy</p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400">Technology Institute</p>
                </div>
              </div>

              <Typewriter
                text={"À propos de\nZentrix Academy"}
                className="text-[2.3rem] font-black leading-tight text-[#0f0f1a]"
                speed={36}
              />

              <div className="mt-3 h-[3px] w-12 rounded bg-[#FF6B00]" />

              <p className="mt-5 text-sm font-semibold leading-7 text-slate-700">
                Nous nous consacrons à révolutionner l'éducation en Afrique et au-delà.
              </p>
              <p className="mt-3 max-w-[52ch] text-sm leading-7 text-slate-500">
                En tant qu'institut en ligne de premier plan, nous développons les compétences
                et proposons une formation de qualité. Notre mission : combler le fossé des
                connaissances et former une main-d'œuvre prête pour l'avenir.{" "}
                <strong className="text-slate-700">La localisation géographique n'est jamais une limite.</strong>
              </p>

              <button
                onClick={() => onNavigate("courses")}
                className="mt-7 inline-flex items-center gap-2 border-b-2 border-[#FF6B00] pb-0.5 text-sm font-bold text-[#FF6B00] transition-all hover:gap-3"
              >
                En savoir plus <ArrowRight className="h-4 w-4" />
              </button>
            </Fade>
          </div>
        </section>

        {/* ══════════════════════ 2.5 · PARCOURS ════════════════════════════ */}
        <section className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">

            {/* En-tête */}
            <Fade from="bottom" className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#FF6B00]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#FF6B00]">Parcours avancés</span>
                </div>
                <h2 className="text-[2rem] font-black leading-tight text-[#0f0f1a]">
                  Des parcours qui inspirent confiance
                </h2>
              </div>
              <button
                onClick={() => onNavigate("courses")}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-[#FF6B00]"
              >
                Voir tous les cours <ArrowRight className="h-4 w-4" />
              </button>
            </Fade>

            {/* Grille 4×2 */}
            <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: Globe,    dur: "30 Jours",    n: "01", title: "Création de contenu digital & monétisation",     desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Cloud,    dur: "12 Semaines", n: "02", title: "Bootcamp cloud computing",                        desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Code2,    dur: "16 Semaines", n: "03", title: "Développement backend avec Node.js",              desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Monitor,  dur: "16 Semaines", n: "04", title: "Maîtrise du développement frontend",             desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Database, dur: "16 Semaines", n: "05", title: "Ingénierie backend avec Python",                  desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: TrendingUp,dur:"20 Semaines", n: "06", title: "Data science & machine learning",                desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Shield,   dur: "12 Semaines", n: "07", title: "Hacking éthique & bug bounty",                   desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
                { Icon: Globe,    dur: "24 Semaines", n: "08", title: "Développement full stack",                        desc: "Programme pratique basé sur des projets réels et une application immédiate dans la carrière." },
              ].map(({ Icon, dur, n, title, desc }, i) => (
                <Fade key={n} from="bottom" delay={i * 0.04}>
                  <div
                    className="group relative flex h-full cursor-pointer flex-col bg-white p-6 transition-all duration-300 hover:bg-[#0d1b2e]"
                    onClick={() => onNavigate("courses")}
                  >
                    {/* Icône */}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00] transition-colors duration-300 group-hover:border-[#FF6B00] group-hover:bg-[#FF6B00]">
                      <Icon className="h-5 w-5 group-hover:text-white" />
                    </div>

                    {/* Durée */}
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#FF6B00]">
                      {dur}
                    </p>

                    {/* Titre */}
                    <h3 className="mb-3 text-[15px] font-black leading-snug text-[#0f0f1a] transition-colors duration-300 group-hover:text-white">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 text-[12px] leading-6 text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
                      {desc}
                    </p>

                    {/* Explorer */}
                    <div className="mt-auto flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#FF6B00] transition-all duration-300 group-hover:gap-2.5">
                      Explorer <ArrowRight className="h-3.5 w-3.5" />
                    </div>

                    {/* Numéro décoratif */}
                    <span className="absolute bottom-4 right-5 text-[3.2rem] font-black leading-none text-slate-100 select-none transition-colors duration-300 group-hover:text-[#1a2d4a]">
                      {n}
                    </span>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ 3 · PROGRAMME ═════════════════════════════ */}
        <section
          className="flex min-h-[calc(100vh-85px)] h-auto items-center bg-[#f6f7f9] py-16 sm:py-20"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-2">

            {/* Left — search + programs */}
            <Fade from="left">
              <Typewriter
                text={"Trouvez votre\nprogramme"}
                className="text-[2.3rem] font-black leading-tight text-[#0f0f1a]"
                speed={34}
              />
              <p className="mt-4 max-w-[46ch] text-sm leading-7 text-slate-500">
                Explorez notre gamme de programmes et découvrez le parcours qui correspond
                à vos objectifs professionnels.
              </p>

              <div className="mt-7 flex items-center overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center px-4 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onNavigate("courses")}
                  placeholder='Trouvez votre programme…'
                  className="h-12 flex-1 bg-transparent pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400">Populaires :</span>
                {TAGS.map(t => (
                  <button key={t} onClick={() => onNavigate("courses")} className="text-xs font-medium text-[#FF6B00] transition hover:underline">
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-7 space-y-2.5">
                {PROGRAMS.map(p => (
                  <button
                    key={p.title}
                    onClick={() => onNavigate("courses")}
                    className="flex w-full items-center gap-4 border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:border-[#FF6B00]/50 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center bg-[#FF6B00]/10">
                      <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="mb-0.5 inline-block rounded bg-[#FF6B00] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                        {p.badge}
                      </span>
                      <p className="text-sm font-bold text-slate-800">{p.title}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </Fade>

            {/* Right — photo collage */}
            <Fade from="right" delay={0.1} className="relative hidden h-[490px] lg:block">
              <div className="absolute left-0 top-0 h-[235px] w-[210px] overflow-hidden shadow-xl">
                <img src="/etudiant-data-science.webp" alt="étudiant" className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105" />
              </div>
              <div className="absolute bottom-0 right-0 h-[395px] w-[252px] overflow-hidden shadow-xl">
                <img src="/etudiante.jpg" alt="étudiante" className="h-full w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105" />
              </div>
              <div className="absolute bottom-[152px] left-[163px] z-10 bg-[#FF6B00] px-5 py-4 shadow-xl">
                <p className="text-[1.7rem] font-black text-white">20+</p>
                <p className="mt-0.5 text-[11px] font-semibold text-white/80">Programmes disponibles</p>
              </div>
            </Fade>
          </div>
        </section>

        {/* ══════════════════════ 4 · CAMPUS STORY ═════════════════════════ */}
        <section
          className="flex min-h-[calc(100vh-85px)] flex-col bg-[#0f0f1a] text-white"
        >
          {/* Photos */}
          <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
            {[
              { src: "/cours.jpg",     label: "Nos cours" },
              { src: "/ordinateur-simulation-visuel-data-science.jpg", label: "Data Science" },
            ].map(({ src, label }) => (
              <div key={src} className="group relative overflow-hidden" style={{ minHeight: "45vh" }}>
                <img
                  src={src}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-between p-6">
                  <Typewriter text={label} as="h3" className="text-base font-black uppercase tracking-wide" speed={55} />
                  <button
                    onClick={() => onNavigate("courses")}
                    className="flex h-9 w-9 items-center justify-center bg-[#FF6B00] transition hover:bg-[#e56000]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <Fade from="bottom" className="border-t border-white/10">
            <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 py-8 sm:px-10 md:grid-cols-4">
              {[
                { Icon: Users,      v: "5 000+", l: "Apprenants actifs" },
                { Icon: BookOpen,   v: "20+",     l: "Programmes disponibles" },
                { Icon: TrendingUp, v: "95%",     l: "Taux de progression" },
                { Icon: Clock3,     v: "24/7",    l: "Accessible partout" },
              ].map(({ Icon, v, l }) => (
                <div key={l} className="flex items-center gap-3 px-4 py-3">
                  <Icon className="h-8 w-8 flex-shrink-0 text-[#FF6B00]" />
                  <div>
                    <p className="text-2xl font-black">{v}</p>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{l}</p>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </section>

        {/* ══════════════════════ 5 · BARRIÈRES ════════════════════════════ */}
        <section
          className="flex min-h-[calc(100vh-85px)] h-auto flex-col items-stretch lg:flex-row"
        >
          {/* Orange side */}
          <div className="relative hidden w-[45%] flex-col justify-center bg-[#FF6B00] p-12 lg:flex">
            <Fade from="left">
              <Typewriter
                text={"Briser les barrières\nà l'éducation"}
                className="text-[2rem] font-black leading-tight text-white"
                speed={30}
              />
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="overflow-hidden shadow-lg">
                  <img src="/etudiant ordinateur.avif" alt="" className="h-40 w-full object-cover transition-transform duration-700 ease-out hover:scale-105" />
                </div>
                <div className="overflow-hidden shadow-lg">
                  <img src="/etudiant-data-science.webp" alt="" className="h-40 w-full object-cover transition-transform duration-700 ease-out hover:scale-105" />
                </div>
              </div>
            </Fade>
          </div>

          {/* White side */}
          <div className="flex flex-1 flex-col justify-center bg-white p-8 lg:p-16">
            <Fade from="right">
              {/* Mobile heading — only visible when orange panel is hidden */}
              <h2 className="mb-6 text-[1.9rem] font-black leading-tight text-[#0f0f1a] lg:hidden">
                Briser les barrières<br />à l'éducation
              </h2>
              <p className="max-w-[54ch] text-sm leading-7 text-slate-600">
                Chez Zentrix Academy, nous nous engageons à supprimer les barrières financières
                et à rendre l'éducation accessible à tous.
              </p>
              <p className="mt-4 max-w-[54ch] text-sm leading-7 text-slate-600">
                En tant qu'institut en ligne, nous permettons aux apprenants d'étudier depuis
                n'importe où.{" "}
                <strong className="text-slate-800">La localisation géographique n'est jamais une limite.</strong>{" "}
                Notre plateforme flexible propose des horaires adaptés et soutient des forums
                interactifs où{" "}
                <strong className="text-slate-800">les apprenants peuvent collaborer et progresser ensemble.</strong>
              </p>

              <button
                onClick={() => onNavigate("courses")}
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#FF6B00] transition-all hover:gap-3"
              >
                Voir comment s'inscrire <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-10 flex items-center gap-4 border-t border-slate-100 pt-8">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00]">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pour toute demande d'admission</p>
                  <p className="font-black text-slate-900">
                    Contactez-nous <span className="text-[#FF6B00]">via la plateforme</span>
                  </p>
                </div>
                <div className="ml-auto hidden items-center gap-2 sm:flex">
                  <img src="/zentrix.avif" alt="Zentrix" className="h-8 w-8 object-contain" />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Zentrix</p>
                    <p className="text-[9px] text-slate-400">Academy</p>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </section>

        {/* ══════════════════════ 6 · FAQ ═══════════════════════════════════ */}
        <section
          className="flex min-h-[calc(100vh-85px)] h-auto items-center bg-white py-16 sm:py-20"
        >
          <div className="mx-auto grid w-full max-w-7xl items-start gap-14 px-6 sm:px-10 lg:grid-cols-[1.15fr_0.85fr]">

            {/* Left */}
            <Fade from="left">
              <Typewriter
                text="Questions fréquentes"
                className="text-[2.3rem] font-black leading-tight text-[#0f0f1a]"
                speed={38}
              />

              <div className="mt-6 flex flex-wrap gap-2">
                {FAQ_TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setFaqTab(t.id); setOpenFaq(null); }}
                    className={`rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
                      faqTab === t.id
                        ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                        : "border-slate-200 text-slate-500 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {(FAQS[faqTab] ?? []).map((q, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className={`text-sm font-semibold transition-colors ${openFaq === i ? "text-[#FF6B00]" : "text-slate-800 hover:text-[#FF6B00]"}`}>
                        {q}
                      </span>
                      <span className={`ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-all ${openFaq === i ? "border-[#FF6B00] bg-[#FF6B00] text-white" : "border-slate-200 text-slate-400"}`}>
                        {openFaq === i
                          ? <ChevronDown className="h-3.5 w-3.5" style={{ transform: "rotate(180deg)" }} />
                          : <ArrowRight className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    {openFaq === i && (
                      <p className="pb-4 text-sm leading-7 text-slate-500">
                        Connectez-vous à votre espace apprenant pour accéder à l'ensemble de vos
                        ressources, cours et outils. Notre équipe de support est disponible 24h/7j
                        pour vous accompagner dans votre parcours.
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate("courses")}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#e56000]"
              >
                Voir tous les cours <ArrowRight className="h-4 w-4" />
              </button>
            </Fade>

            {/* Right — photo */}
            <Fade from="right" delay={0.1} className="hidden lg:block">
              <div className="overflow-hidden shadow-2xl">
                <img
                  src="/etudiante.jpg"
                  alt="étudiante"
                  className="h-[570px] w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
            </Fade>
          </div>
        </section>

      </div>
    </>
  );
}
