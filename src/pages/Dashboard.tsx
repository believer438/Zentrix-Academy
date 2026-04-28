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
import { Skeleton } from "@/components/ui/skeleton";
import { mockCourses } from "@/lib/mock-data";
import {
  FadeUp,
  RevealLine,
  ScaleIn,
  SlideInLeft,
  SlideInRight,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ViewportTransitions";

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
    image: "/cours.jpg",
  },
  {
    tag: "Apprentissage tout au long de la vie",
    title: "Continuez d'apprendre, de progresser et de garder une longueur d'avance.",
    subtitle:
      "Des programmes structures, une bibliotheque active et des outils IA integres pour rester en progression continue.",
    image: "/zati/hero-2.avif",
  },
  {
    tag: "Pratique. Transformateur.",
    title: "Vraies competences. Vrais projets. Vrai impact de carriere.",
    subtitle:
      "Une methode efficace d'apprentissage rapide et dans moins de temps que prevue , la conception et l'evolution des vos projets c'est maintenant",
    image: "/etudiante.jpg",
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
  "Des parcours professionnalisants construits autour de competences directement applicables.",
  "Une progression guidee, avec ressources, pratique et evaluation a chaque etape.",
  "Un environnement unique pour apprendre, reviser, consulter des ressources et avancer avec confiance.",
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

const popularTags = [
  "IntelligenceArtificielle",
  "ScienceDesDonnees",
  "TechBootcamp",
  "DeveloppementFullStack",
  "MERNStack",
  "InnovationTech",
];

function normalizeCourse(raw: any, index: number): ExploreCourse {
  return {
    id: String(raw?.id ?? `course-${index}`),
    title: String(raw?.title ?? "Cours"),
    description: String(raw?.description ?? ""),
    categoryName: String(raw?.categoryName ?? raw?.category ?? "General"),
  };
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreResults, setExploreResults] = useState<ExploreCourse[]>([]);
  const [exploreError, setExploreError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const HERO_AUTOPLAY_MS = 6000;

  const changeSlide = (next: number) => {
    setActiveSlide((current) => {
      if (next === current) return current;
      return next;
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, HERO_AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY || 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

    const timer = window.setTimeout(() => {
      setExploreLoading(true);
      setExploreError("");
      setHasSearched(true);

      const lowered = query.toLowerCase();
      const matches = mockCourses
        .filter((course) => {
          const haystack = [
            course.title,
            course.description,
            course.categoryName,
            course.tags?.join(" ") ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(lowered);
        })
        .slice(0, 8)
        .map((course, index) => normalizeCourse(course, index));

      setExploreResults(matches);
      setExploreLoading(false);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [exploreQuery]);

  const runSearchNow = () => {
    const query = exploreQuery.trim();
    if (!query) return;

    setExploreLoading(true);
    setExploreError("");
    setHasSearched(true);

    const lowered = query.toLowerCase();
    const matches = mockCourses
      .filter((course) => {
        const haystack = [
          course.title,
          course.description,
          course.categoryName,
          course.tags?.join(" ") ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(lowered);
      })
      .slice(0, 8)
      .map((course, index) => normalizeCourse(course, index));

    setExploreResults(matches);
    setExploreLoading(false);
  };

  const heroParallaxY = Math.min(scrollY * 0.3, 180);
  const heroContentOpacity = Math.max(0, 1 - scrollY / 500);
  const currentHeroSlide = heroSlides[activeSlide];

  return (
    <div className="min-h-full bg-white dark:bg-[#0b0d14]">
      <section className="relative min-h-[78vh] overflow-hidden bg-[#0f0f1a] text-white">
        <div className="absolute inset-0 overflow-hidden" style={{ transform: `translate3d(0, ${heroParallaxY}px, 0)` }}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.image}
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{
                opacity: index === activeSlide ? 1 : 0,
                transform: index === activeSlide ? "scale(1)" : "scale(1.04)",
              }}
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover object-right" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[#070b14]/76" />
        <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-[linear-gradient(270deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.18)_36%,transparent_100%)] mix-blend-screen lg:block" />
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28),transparent_72%)] lg:block" />
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

        <div
          className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 py-14 sm:px-8 lg:max-w-[88rem] lg:py-16"
          style={{ opacity: heroContentOpacity }}
        >
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
            <div className="w-full max-w-4xl">
              <div className="relative min-h-[500px] sm:min-h-[470px] lg:min-h-[450px]">
                <div key={activeSlide} className="absolute inset-0 z-[2]">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-10 bg-[#FF6B00]" />
                    <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#FF6B00]">
                      {currentHeroSlide.tag}
                    </span>
                  </div>

                  <h1 className="mt-8 max-w-[20ch] text-[2.45rem] font-black leading-[1.04] tracking-tight sm:text-[3.15rem] lg:text-[4rem]">
                    {currentHeroSlide.title}
                  </h1>
                  <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-200 sm:text-[1.02rem]">
                    {currentHeroSlide.subtitle}
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
                      className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
                    >
                      Document IA
                    </button>
                  </div>

                </div>
              </div>

              <div className="mt-10 flex items-center gap-3">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.tag}
                    onClick={() => changeSlide(i)}
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

            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden border border-white/12 bg-white/6 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
                <div className="relative h-[520px] overflow-hidden bg-slate-900">
                  {heroSlides.map((slide, index) => (
                    <img
                      key={slide.image}
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 h-full w-full object-cover object-right transition-all duration-1000 ease-out"
                      style={{
                        opacity: index === activeSlide ? 1 : 0,
                        transform: index === activeSlide ? "scale(1)" : "scale(1.03)",
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#08101c]/58 via-transparent to-white/18" />
                  <div className="absolute inset-y-0 right-0 w-[58%] bg-[linear-gradient(270deg,rgba(255,255,255,0.56)_0%,rgba(255,255,255,0.22)_42%,transparent_100%)] mix-blend-screen" />
                  <div className="absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.34),transparent_74%)]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07101d] via-[#07101d]/68 to-transparent p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#FFB347]">
                      Zentrix Academy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FF6B00] py-0 text-white">
        <StaggerContainer className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-orange-500 px-4 sm:px-8 md:grid-cols-4">
          {stats.map((item, index) => (
            <StaggerItem key={item.label} index={index}>
              <div className="flex flex-col items-center justify-center px-4 py-7 text-center">
                <span className="text-[30px] font-black leading-none">{item.value}</span>
                <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-100">{item.label}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="bg-[#f3f4f6] py-16 dark:bg-[#0f1219]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <SlideInLeft>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">A propos</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#0f0f1a] dark:text-white">Apprentissage continu</h2>
              <h3 className="mt-1 text-3xl font-black leading-tight text-[#0f0f1a] dark:text-white">
                Concu pour les professionnels ambitieux
              </h3>
              <RevealLine className="mt-6 h-1 w-20 bg-[#FF6B00]" />
              <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                Zentrix Academy est une plateforme majeure d'apprentissage continu, concue pour les professionnels en
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
            </SlideInLeft>

            <SlideInRight delay={0.15}>
              <div className="relative overflow-visible bg-[linear-gradient(145deg,#31203a_0%,#1c1530_45%,#0c1224_100%)] px-10 py-14 text-white transition-transform duration-400 hover:scale-[1.02]">
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
            </SlideInRight>
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
          <FadeUp className="mx-auto max-w-3xl text-center">
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
          </FadeUp>

          <div className="mx-auto mt-10 max-w-6xl">
            <div className="mx-auto max-w-4xl">
              <FadeUp delay={0.2} className="flex flex-col overflow-hidden border border-white/20 sm:flex-row">
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
              </FadeUp>
            </div>

            <FadeUp delay={0.3} className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center gap-2 text-xs">
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
            </FadeUp>

            {(exploreLoading || hasSearched) && (
              <div className="mt-8">
                {exploreLoading && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="rounded-none border border-white/15 bg-white/5 p-5">
                        <Skeleton className="h-44 w-full rounded-none bg-white/10" />
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
                  <p className="rounded-none border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {exploreError}
                  </p>
                )}

                {!exploreLoading && !exploreError && exploreResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {exploreResults.map((course) => (
                      <article
                        key={course.id}
                        className="rounded-none border border-white/15 bg-white/7 p-5 text-left transition-colors hover:border-[#FF6B00]/70"
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
            <FadeUp>
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-[#FF6B00]" />
                <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#FF6B00]">Parcours avances</span>
              </div>
              <h2 className="mt-5 text-3xl font-black text-[#0f0f1a] dark:text-white">Des parcours qui inspirent confiance</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <button
                onClick={() => onNavigate("courses")}
                className="inline-flex items-center gap-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] dark:border-slate-700 dark:text-slate-400"
              >
                Voir tous les cours
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </FadeUp>
          </div>

          <StaggerContainer className="grid overflow-hidden border border-slate-200 md:grid-cols-2 xl:grid-cols-4 dark:border-slate-700">
            {tracks.map((track, index) => {
              const Icon = track.icon;
              return (
                <StaggerItem key={track.title} index={index}>
                  <article className="group relative border-b border-r border-slate-200 bg-white px-5 py-4 transition-all duration-[350ms] hover:-translate-y-1 hover:bg-[#0f0f1a] dark:border-slate-700 dark:bg-[#0f1219]">
                    <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-[#FF6B00] transition-all duration-300 group-hover:rotate-[5deg] group-hover:scale-105 group-hover:border-white/20 group-hover:bg-[#FF6B00] group-hover:text-white dark:border-slate-700 dark:bg-slate-900/60">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8d9cbd] transition-colors duration-300 group-hover:text-white/70">{track.subtitle}</p>
                    <h3 className="mt-2 max-w-[30ch] text-[1.28rem] font-black leading-tight text-[#0f0f1a] transition-colors duration-300 group-hover:text-white dark:text-white">
                      {track.title}
                    </h3>
                    <p className="mt-2.5 max-w-[40ch] text-[12px] leading-5 text-slate-500 transition-colors duration-300 group-hover:text-slate-300 dark:text-slate-400">
                      {track.description}
                    </p>
                    <button
                      onClick={() => onNavigate("courses")}
                      className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF6B00]"
                    >
                      Explorer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="pointer-events-none absolute bottom-1 right-3 text-[54px] font-black leading-none text-slate-100 transition-colors duration-300 group-hover:text-white/10 dark:text-slate-800">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6B00] transition-all duration-500 group-hover:w-full" />
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-[#0b0d14]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SlideInLeft className="border border-slate-200 bg-[#0f0f1a] p-8 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-[#FF6B00]" />
              <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#FF6B00]">Points forts</span>
            </div>
            <h2 className="mt-5 text-3xl font-black">Une plateforme de formation claire, ambitieuse et orientee resultats.</h2>
            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FF6B00]" />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
                ))}
              </div>
          </SlideInLeft>

          <SlideInRight delay={0.15} className="grid gap-6">
            <ScaleIn className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#11141d]">
              <div className="relative">
                <img src="/zati/hero-2.avif" alt="Programmes" className="h-64 w-full object-cover object-right" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/38 via-transparent to-white/18" />
                <div className="absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(270deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.12)_42%,transparent_100%)] mix-blend-screen" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">Apercu de la plateforme</p>
                <h3 className="mt-3 text-2xl font-black text-[#0f0f1a] dark:text-white">
                  Une presentation claire et engageante pour valoriser la plateforme des le premier regard.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Nous donnons plus de clarte au visuel principal, une meilleure hierarchie aux messages et un rendu plus rassurant pour un premier passage sur le site.
                </p>
              </div>
            </ScaleIn>

            <StaggerContainer className="grid gap-6 md:grid-cols-2">
              {news.map((item, index) => (
                <StaggerItem key={item.title} index={index}>
                  <article className="border border-slate-200 bg-slate-50 p-6 transition-transform duration-300 hover:translate-x-1 dark:border-slate-800 dark:bg-[#10131c]">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date}
                    </div>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.tag}</p>
                    <h3 className="mt-2 text-lg font-black text-[#0f0f1a] dark:text-white">{item.title}</h3>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </SlideInRight>
        </div>
      </section>

    </div>
  );
}
