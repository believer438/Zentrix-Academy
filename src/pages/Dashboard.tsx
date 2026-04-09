import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Cloud,
  Code2,
  Clock3,
  Cpu,
  Database,
  GraduationCap,
  Globe,
  Search,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { buildApiUrl } from "@/lib/env";

interface DashboardProps {
  onNavigate: (page: string, data?: unknown) => void;
}

interface ExploreCourse {
  id: string;
  title: string;
  description: string;
  categoryName: string;
}

const stats = [
  { value: "20+", label: "Parcours de formation", icon: BookOpen },
  { value: "5 000+", label: "Apprenants actifs", icon: Users },
  { value: "95%", label: "Progression constatee", icon: TrendingUp },
  { value: "24/7", label: "Acces a la plateforme", icon: Clock3 },
];

const heroSlides = [
  {
    tag: "Plateforme d'apprentissage continu",
    title: "Montez en competences. Evoluez. Avancez a votre rythme.",
    subtitle:
      "Une experience d'accueil premium avec des parcours visibles des l'entree et une transition fluide vers votre espace cours.",
    image: "/zati/hero-1.png",
  },
  {
    tag: "Apprentissage tout au long de la vie",
    title: "Continuez d'apprendre, de progresser et de garder une longueur d'avance.",
    subtitle:
      "Des programmes structures, une bibliotheque active et des outils IA integres pour rester en progression continue.",
    image: "/zati/hero-2.png",
  },
  {
    tag: "Pratique. Transformateur.",
    title: "Vraies competences. Vrais projets. Vrai impact de carriere.",
    subtitle:
      "Un accueil inspirant pour la marque, puis un acces direct a votre plateforme actuelle dans la section Cours.",
    image: "/zati/hero-3.png",
  },
];

const tracks = [
  {
    title: "Creation de contenu digital & monetisation",
    subtitle: "30 JOURS",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Globe,
  },
  {
    title: "Bootcamp cloud computing",
    subtitle: "12 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Cloud,
  },
  {
    title: "Developpement backend avec Node.js",
    subtitle: "16 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Code2,
  },
  {
    title: "Maitrise du developpement frontend",
    subtitle: "16 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Cpu,
  },
  {
    title: "Ingenierie backend avec Python",
    subtitle: "16 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Database,
  },
  {
    title: "Data science & machine learning",
    subtitle: "20 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: TrendingUp,
  },
  {
    title: "Hacking ethique & bug bounty",
    subtitle: "12 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Shield,
  },
  {
    title: "Developpement full stack",
    subtitle: "24 SEMAINES",
    description: "Programme pratique base sur des projets reels et une application immediate dans la carriere.",
    icon: Globe,
  },
];

const highlights = [
  "Un accueil inspire des plateformes academiques premium",
  "Des parcours clairs, structurés et faciles a reprendre",
  "Une bibliotheque, des quiz et un assistant IA dans le meme espace",
];

const news = [
  {
    tag: "Mise a jour",
    title: "Nouveaux parcours technologiques disponibles cette session",
    date: "Avril 2026",
  },
  {
    tag: "Bibliotheque",
    title: "Des ressources supplementaires ont ete ajoutees aux parcours de cours",
    date: "Cette semaine",
  },
];

const faq = [
  {
    id: "faq-1",
    question: "Ou retrouver la plateforme actuelle de cours ?",
    answer: "La section Cours conserve votre application actuelle. L'accueil sert d'entree vitrine et les parcours restent accessibles dans la navigation.",
  },
  {
    id: "faq-2",
    question: "L'assistant IA est-il toujours disponible ?",
    answer: "Oui. Vous pouvez toujours ouvrir l'assistant IA depuis la navigation haute ou le bouton flottant mobile.",
  },
  {
    id: "faq-3",
    question: "Puis-je utiliser l'accueil comme page principale ?",
    answer: "Oui. Cet accueil est maintenant la premiere experience, tandis que les pages internes gardent votre logique actuelle.",
  },
];

const popularTags = [
  "IntelligenceArtificielle",
  "ScienceDesDonnees",
  "TechBootcamp",
  "DeveloppementFullStack",
  "MERNStack",
  "UgandaTech",
];

function normalizeCourse(raw: any, index: number): ExploreCourse {
  return {
    id: String(raw?.id ?? `course-${index}`),
    title: String(raw?.title ?? "Cours"),
    description: String(raw?.description ?? "Description du cours non disponible."),
    categoryName: String(raw?.categoryName ?? raw?.category ?? "General"),
  };
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreResults, setExploreResults] = useState<ExploreCourse[]>([]);
  const [exploreError, setExploreError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const query = exploreQuery.trim();
    if (!query) {
      setExploreResults([]);
      setExploreError("");
      setExploreLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setExploreLoading(true);
      setExploreError("");
      setHasSearched(true);

      try {
        const response = await fetch(
          buildApiUrl(`/api/courses?search=${encodeURIComponent(query)}&limit=4`),
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const payload = await response.json();
        const source = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
        setExploreResults((source as any[]).slice(0, 8).map(normalizeCourse));
      } catch (error) {
        if (controller.signal.aborted) return;
        setExploreResults([]);
        setExploreError("Impossible de recuperer les cours pour le moment.");
      } finally {
        if (!controller.signal.aborted) setExploreLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [exploreQuery]);

  const runSearchNow = async () => {
    const query = exploreQuery.trim();
    if (!query) return;

    setExploreLoading(true);
    setExploreError("");
    setHasSearched(true);

    try {
      const response = await fetch(
        buildApiUrl(`/api/courses?search=${encodeURIComponent(query)}&limit=4`)
      );
      if (!response.ok) throw new Error("Failed to fetch courses");
      const payload = await response.json();
      const source = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
      setExploreResults((source as any[]).slice(0, 8).map(normalizeCourse));
    } catch {
      setExploreResults([]);
      setExploreError("Impossible de recuperer les cours pour le moment.");
    } finally {
      setExploreLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-[#0b0d14]">
      <section className="relative min-h-[78vh] overflow-hidden bg-[#0f0f1a] text-white">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-[#070b14]/80" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,107,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.18) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#FF6B00]" />
        <div className="absolute left-0 top-0 h-1 w-52 bg-[#FF6B00]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_30%)]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 py-14 sm:px-8 lg:py-16">
          <div className="w-full max-w-5xl">
            <div className="relative min-h-[500px] sm:min-h-[470px] lg:min-h-[450px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.tag}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    index === activeSlide
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-3 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-px w-10 bg-[#FF6B00]" />
                    <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#FF6B00]">
                      {slide.tag}
                    </span>
                  </div>

                  <h1 className="mt-8 max-w-[20ch] text-[2.6rem] font-black leading-[1.08] tracking-tight sm:text-[3.35rem] lg:text-[4rem]">
                    {slide.title}
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    {slide.subtitle}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => onNavigate("courses")}
                      className="inline-flex items-center justify-center gap-2 bg-[#FF6B00] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#e56000]"
                    >
                      Ouvrir les cours
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onNavigate("document-ai")}
                      className="inline-flex items-center justify-center gap-2 border border-white/20 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    >
                      Document IA
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.tag}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 transition-all duration-300 ${
                    i === activeSlide ? "w-10 bg-[#FF6B00]" : "w-4 bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Diapositive ${i + 1}`}
                />
              ))}
              <span className="ml-2 text-xs font-mono text-white/50">
                0{activeSlide + 1} / 0{heroSlides.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FF6B00] py-0 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-orange-500 px-4 sm:px-8 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center px-4 py-7 text-center">
              <span className="text-[30px] font-black leading-none">{item.value}</span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-100">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f3f4f6] py-16 dark:bg-[#0f1219]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">A propos</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#0f0f1a] dark:text-white">Apprentissage continu</h2>
              <h3 className="mt-1 text-3xl font-black leading-tight text-[#0f0f1a] dark:text-white">
                Concu pour les professionnels africains
              </h3>
              <div className="mt-6 h-1 w-20 bg-[#FF6B00]" />
              <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                ZATI est une plateforme majeure d'apprentissage continu en Afrique, concue pour les professionnels en
                activite, les personnes en reconversion et les apprenants qui veulent garder une longueur d'avance dans
                un environnement technologique en evolution rapide.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Nous combinons des parcours structures, des mentors experts et des projets concrets pour vous permettre
                de monter en competences sans perturber votre quotidien.
              </p>
              <button
                onClick={() => onNavigate("courses")}
                className="mt-8 inline-flex items-center gap-2 text-2xl font-bold uppercase tracking-[0.12em] text-[#FF6B00] transition-colors hover:text-[#e56000]"
              >
                En savoir plus
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative overflow-visible bg-[linear-gradient(145deg,#31203a_0%,#1c1530_45%,#0c1224_100%)] px-10 py-14 text-white">
              <div className="absolute -left-3 -top-3 h-16 w-16 border-l-4 border-t-4 border-[#FF6B00]" />
              <div className="absolute -bottom-3 -right-3 h-16 w-16 border-b-4 border-r-4 border-[#FF6B00]" />

              <div className="mb-10 flex justify-center">
                <GraduationCap className="h-14 w-14 text-[#FF6B00]" />
              </div>

              <div className="mx-auto grid max-w-[420px] grid-cols-2 gap-4">
                {[
                  { value: "20+", label: "COURS" },
                  { value: "5K+", label: "APPRENANTS" },
                  { value: "95%", label: "REUSSITE" },
                  { value: "5+", label: "ANS" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-white/15 bg-white/5 px-4 py-6 text-center backdrop-blur-sm"
                  >
                    <p className="text-5xl font-black leading-none text-white">{item.value}</p>
                    <p className="mt-3 text-xs font-bold tracking-[0.2em] text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#070b1a] py-20 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,107,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#FF6B00]" />
              <span className="text-xs font-bold uppercase tracking-[0.34em] text-[#FF6B00]">Explorer</span>
              <div className="h-px w-10 bg-[#FF6B00]" />
            </div>
            <h2 className="text-4xl font-semibold leading-tight text-white">Trouvez votre parcours d'apprentissage</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Parcourez nos cours selectionnes et nos parcours intensifs concus pour les professionnels qui veulent
              progresser, se reorienter ou approfondir leur expertise a leur propre rythme.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl">
            <div className="flex flex-col overflow-hidden border border-white/20 sm:flex-row">
              <input
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="Rechercher des cours, parcours, competences, sujets..."
                className="h-14 flex-1 bg-white/7 px-5 text-base text-white placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={runSearchNow}
                className="inline-flex h-14 items-center justify-center gap-2 bg-[#FF6B00] px-8 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#e56000]"
              >
                <Search className="h-4 w-4" />
                Rechercher
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="mr-2 text-slate-400">Populaires :</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setExploreQuery(tag)}
                  className="border border-white/15 bg-white/5 px-4 py-1.5 text-slate-300 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {(exploreLoading || hasSearched) && (
              <div className="mt-8">
                {exploreLoading && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                        <Skeleton className="h-44 w-full rounded-xl bg-white/10" />
                        <Skeleton className="mt-5 h-4 w-24 bg-white/10" />
                        <Skeleton className="mt-3 h-6 w-5/6 bg-white/10" />
                        <Skeleton className="mt-3 h-4 w-full bg-white/10" />
                        <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
                        <Skeleton className="mt-6 h-9 w-36 bg-white/10" />
                      </div>
                    ))}
                  </div>
                )}

                {!exploreLoading && exploreError && (
                  <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {exploreError}
                  </p>
                )}

                {!exploreLoading && !exploreError && exploreResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {exploreResults.map((course) => (
                      <article
                        key={course.id}
                        className="rounded-2xl border border-white/15 bg-white/7 p-5 text-left transition-colors hover:border-[#FF6B00]/70"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                          {course.categoryName}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-base font-semibold text-white">{course.title}</h3>
                        <p className="mt-2 line-clamp-3 text-xs text-slate-300">{course.description}</p>
                        <button
                          onClick={() => onNavigate("courses")}
                          className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#FF6B00]"
                        >
                          Ouvrir dans les cours
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </article>
                    ))}
                  </div>
                )}

                {!exploreLoading && !exploreError && exploreResults.length === 0 && (
                  <p className="text-sm text-slate-400">Aucun cours trouve pour cette recherche.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-[#10131c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-[#FF6B00]" />
                <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#FF6B00]">Parcours avances</span>
              </div>
              <h2 className="mt-5 text-3xl font-black text-[#0f0f1a] dark:text-white">Des parcours qui inspirent confiance</h2>
            </div>
            <button
              onClick={() => onNavigate("courses")}
              className="inline-flex items-center gap-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-400"
            >
              Voir tous les cours
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid overflow-hidden border border-slate-200 md:grid-cols-2 xl:grid-cols-4 dark:border-slate-700">
            {tracks.map((track, index) => {
              const Icon = track.icon;
              return (
                <article
                  key={track.title}
                  className="group relative border-b border-r border-slate-200 bg-white px-7 py-5 transition-colors duration-300 hover:bg-[#0f0f1a] dark:border-slate-700 dark:bg-[#0f1219]"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 text-[#FF6B00] transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10 dark:border-slate-700 dark:bg-slate-900/60">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d9cbd] transition-colors duration-300 group-hover:text-white/70">{track.subtitle}</p>
                  <h3 className="mt-2 max-w-[30ch] text-[1.6rem] font-black leading-tight text-[#0f0f1a] transition-colors duration-300 group-hover:text-white dark:text-white">
                    {track.title}
                  </h3>
                  <p className="mt-3 max-w-[40ch] text-[13px] leading-6 text-slate-500 transition-colors duration-300 group-hover:text-slate-300 dark:text-slate-400">
                    {track.description}
                  </p>
                  <button
                    onClick={() => onNavigate("courses")}
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF6B00]"
                  >
                    Explorer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-1 right-4 text-[68px] font-black leading-none text-slate-100 transition-colors duration-300 group-hover:text-white/10 dark:text-slate-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-[#0b0d14]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-slate-200 bg-[#0f0f1a] p-8 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-[#FF6B00]" />
              <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#FF6B00]">Points forts</span>
            </div>
            <h2 className="mt-5 text-3xl font-black">Un accueil type institution, sans perdre votre produit.</h2>
            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF6B00]" />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("courses")}
              className="mt-8 inline-flex items-center gap-2 bg-[#FF6B00] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#e56000]"
            >
              Aller dans cours
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6">
            <div className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#11141d]">
              <img src="/zati/hero-2.png" alt="Programmes" className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">Apercu de la plateforme</p>
                <h3 className="mt-3 text-2xl font-black text-[#0f0f1a] dark:text-white">
                  Un accueil visuel fort pour accueillir les visiteurs avant d’entrer dans les cours.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  L’objectif est de mettre en valeur la marque, les programmes et la crédibilité, puis de laisser la
                  navigation <strong className="text-slate-700 dark:text-slate-200">Cours</strong> ouvrir votre plateforme actuelle.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {news.map((item) => (
                <article key={item.title} className="border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#10131c]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.date}
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.tag}</p>
                  <h3 className="mt-2 text-lg font-black text-[#0f0f1a] dark:text-white">{item.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f1a] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-[#FF6B00]" />
              <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#FF6B00]">Questions frequentes</span>
            </div>
            <h2 className="mt-5 text-3xl font-black">Une page d’accueil premium, un espace cours conserve.</h2>
            <Accordion type="single" collapsible className="mt-8 w-full border-t border-white/10">
              {faq.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-white/10">
                  <AccordionTrigger className="text-left text-base font-bold text-white hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-slate-400">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
            <img src="/zati/hero-3.png" alt="Communaute" className="h-full min-h-[420px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-8 dark:bg-[#0b0d14]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t-4 border-[#FF6B00] bg-[#0a0a14] px-6 py-10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">Etape suivante</p>
            <h2 className="mt-3 text-3xl font-black">Entrez maintenant dans votre plateforme actuelle.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              L’accueil met la marque en valeur. La section Cours ouvre ensuite votre espace d’apprentissage existant.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate("courses")}
              className="bg-[#FF6B00] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#e56000]"
            >
              Aller dans cours
            </button>
            <button
              onClick={() => onNavigate("library")}
              className="border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
            >
              Bibliotheque
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
