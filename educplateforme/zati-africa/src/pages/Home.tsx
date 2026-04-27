import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  Search,
  GraduationCap,
  ChevronDown,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Menu,
  X,
  Shield,
  Code,
  Database,
  Cloud,
  Cpu,
  Globe,
  BookOpen,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about", hasDropdown: true, submenu: ["Platform Overview", "Mission & Values", "Our Story"] },
  { name: "All Courses", href: "#programs" },
  { name: "Enroll", href: "#enroll", hasDropdown: true, submenu: ["How To Enroll", "Course Fees", "Learning Calendar"] },
  { name: "News", href: "#news" },
  { name: "Events", href: "#events" },
  { name: "Careers", href: "#careers" },
  { name: "Community", href: "#community" },
];

const DIPLOMA_PROGRAMS = [
  { title: "Advanced Track in Cyber Security", category: "Cyber Security", icon: Shield, duration: "Self-paced", color: "#FF6B00" },
  { title: "Advanced Track in Data Science", category: "Data Science", icon: Database, duration: "Self-paced", color: "#1a1a2e" },
  { title: "Advanced Track in Software Engineering", category: "Software Engineering", icon: Code, duration: "Self-paced", color: "#FF6B00" },
  { title: "Advanced Track in Cloud Computing", category: "Cloud Computing", icon: Cloud, duration: "Self-paced", color: "#1a1a2e" },
];

const BOOTCAMPS = [
  { title: "Digital Content Creation & Monetization", icon: Globe, weeks: "30 Days" },
  { title: "Cloud Computing Bootcamp", icon: Cloud, weeks: "12 Weeks" },
  { title: "Backend Development with Node.js", icon: Code, weeks: "16 Weeks" },
  { title: "Frontend Development Mastery", icon: Cpu, weeks: "16 Weeks" },
  { title: "Backend Engineering with Python", icon: Database, weeks: "16 Weeks" },
  { title: "Data Science & Machine Learning", icon: TrendingUp, weeks: "20 Weeks" },
  { title: "Ethical Hacking & Bug Bounty", icon: Shield, weeks: "12 Weeks" },
  { title: "Full Stack Development", icon: Globe, weeks: "24 Weeks" },
];

const HERO_SLIDES = [
  {
    headline: "Upskill. Grow. Lead — At Your Own Pace.",
    sub: "Africa's premier continuous learning platform — delivering world-class tech skills to working professionals and learners across the continent.",
    tag: "Continuous Learning Platform",
  },
  {
    headline: "Keep Learning, Keep Growing, Stay Ahead.",
    sub: "Our platform empowers you to deepen your expertise, pivot your career, and master in-demand skills without leaving your life behind.",
    tag: "Lifelong Learning",
  },
  {
    headline: "Real Skills. Real Projects. Real Career Impact.",
    sub: "We pair structured learning paths with hands-on projects so you graduate as a practitioner, not just a certificate holder.",
    tag: "Practical. Transformative.",
  },
];

const STATS = [
  { value: "20+", label: "Learning Paths", icon: BookOpen },
  { value: "5000+", label: "Active Learners", icon: Users },
  { value: "95%", label: "Career Advancement", icon: TrendingUp },
  { value: "15+", label: "Industry Partners", icon: Award },
];

type AnimatedBlockProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  delay?: number;
};

function FadeUp({ children, delay = 0, className = "", ...rest }: AnimatedBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function SlideInLeft({ children, delay = 0, className = "", ...rest }: AnimatedBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -80 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function SlideInRight({ children, delay = 0, className = "", ...rest }: AnimatedBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 80 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "", ...rest }: AnimatedBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealLine({ className = "" }: { className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0, transformOrigin: "left" }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`h-1 bg-[#FF6B00] ${className}`}
    />
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">

      {/* Top Bar */}
      <div className="bg-[#0f0f1a] text-white/70 py-2 px-4 md:px-8 text-xs flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-6">
          <a href="mailto:info@zentrix.africa" className="flex items-center gap-1.5 hover:text-[#FF6B00] transition-colors duration-300">
            <Mail className="w-3 h-3" /> info@zentrix.africa
          </a>
          <a href="tel:+256414673086" className="flex items-center gap-1.5 hover:text-[#FF6B00] transition-colors duration-300">
            <Phone className="w-3 h-3" /> +243 999371251
          </a>
        </div>
        <div className="flex items-center gap-3">
          {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="hover:text-[#FF6B00] transition-colors duration-300">
              <Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-400 ${isScrolled ? 'bg-white shadow-xl py-2 border-b-2 border-[#FF6B00]' : 'bg-white/98 py-3'}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 z-50">
            <img src="https://zentrix.africa/wp-content/uploads/2024/10/zentrix-logo-1-193-x-193-px.svg" alt="Zentrix Logo" className="h-10 w-10 object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-700">
            {NAV_LINKS.map((link) => (
              <div
                key={link.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-1 hover:text-[#FF6B00] transition-colors duration-200 py-2 px-3 relative"
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                  )}
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FF6B00] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
                {link.hasDropdown && link.submenu && (
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 bg-white shadow-2xl border-t-2 border-[#FF6B00] min-w-[200px] py-2"
                      >
                        {link.submenu.map((item) => (
                          <a key={item} href="#" className="block px-5 py-2.5 text-sm text-slate-600 hover:bg-[#FF6B00] hover:text-white transition-colors duration-200">
                            {item}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:block">
            <a
              href="https://bit.ly/zentrix2025"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6B00] hover:bg-[#E56000] text-white px-7 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 inline-block"
            >
              APPLY NOW
            </a>
          </div>

          <button className="lg:hidden z-50 text-slate-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a key={link.name} href={link.href} className="py-3 border-b border-slate-100 text-slate-700 font-medium hover:text-[#FF6B00] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {link.name}
                  </a>
                ))}
                <div className="pt-4">
                  <a href="https://bit.ly/zentrix2026" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#FF6B00] text-white text-center py-3 font-bold tracking-wide">
                    APPLY NOW
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative bg-[#0f0f1a] overflow-hidden" style={{ minHeight: "90vh" }}>
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
        </div>

        {/* Parallax background */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#1a1a3e] to-[#0f0f1a]"
        />

        {/* Orange accent lines */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B00]" />
        <div className="absolute top-0 left-0 w-48 h-1 bg-[#FF6B00]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 min-h-[90vh] flex items-center">
          <div className="container mx-auto px-4 md:px-16 py-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="max-w-4xl"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="w-8 h-0.5 bg-[#FF6B00]" />
                  <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">{slide.tag}</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight"
                >
                  {slide.headline}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-slate-300 text-base md:text-lg leading-relaxed mb-10 max-w-2xl"
                >
                  {slide.sub}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  <a
                    href="#programs"
                    className="group bg-[#FF6B00] hover:bg-[#E56000] text-white px-8 py-3.5 font-bold text-sm tracking-wider transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-2"
                  >
                    EXPLORE COURSES
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                  <a
                    href="#about"
                    className="border border-white/25 hover:border-[#FF6B00] text-white hover:text-[#FF6B00] px-8 py-3.5 font-bold text-sm tracking-wider transition-all duration-300"
                  >
                    LEARN MORE
                  </a>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide indicators */}
            <div className="absolute bottom-16 left-4 md:left-16 flex items-center gap-3">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`transition-all duration-400 ${i === activeSlide ? 'w-10 h-1 bg-[#FF6B00]' : 'w-4 h-1 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>

            {/* Slide number */}
            <div className="absolute bottom-16 right-4 md:right-16 text-white/30 text-xs font-mono">
              0{activeSlide + 1} / 0{HERO_SLIDES.length}
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className="absolute bottom-0 left-0 w-full z-20">
          <div className="container mx-auto px-4 md:px-16">
            <div className="flex max-w-lg border-t border-white/10">
              {['Start Learning', 'Community', 'Alumni'].map((tab, i) => (
                <button
                  key={tab}
                  className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${i === 0 ? 'bg-[#FF6B00] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS STRIP ═══════════════════ */}
      <section className="bg-[#FF6B00] py-0">
        <StaggerContainer className="container mx-auto px-4 md:px-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-orange-600">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <div className="flex flex-col items-center justify-center py-8 px-4 text-white">
                  <Icon className="w-6 h-6 mb-2 opacity-70" />
                  <span className="text-3xl font-black">{stat.value}</span>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-80 mt-1 text-center">{stat.label}</span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ═══════════════════ ABOUT ═══════════════════ */}
      <section id="about" className="py-24 md:py-36 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-slate-50 -skew-x-6 translate-x-24 z-0" />
        <div className="container mx-auto px-4 md:px-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <SlideInLeft>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">About Us</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[#0f0f1a] mb-6 leading-tight">
                Continuous Learning<br />Built for African Professionals
              </h2>
              <RevealLine className="w-16 mb-8" />
              <p className="text-slate-500 mb-4 leading-relaxed text-sm">
                Zentrix is Africa's leading continuous learning platform — designed for working professionals, career-switchers, and lifelong learners who want to stay ahead in a rapidly evolving tech landscape.
              </p>
              <p className="text-slate-500 mb-10 leading-relaxed text-sm">
                We combine structured learning paths, expert mentors, and real-world projects so you can upskill without disrupting your life.
              </p>
              <a
                href="#"
                className="group inline-flex items-center gap-3 text-sm font-bold text-[#FF6B00] uppercase tracking-wider hover:gap-5 transition-all duration-300"
              >
                More About Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </SlideInLeft>

            <SlideInRight delay={0.15}>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <motion.div
                    className="w-full h-full bg-gradient-to-br from-[#1a1a3e] to-[#0f0f1a] flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent" />
                    <div className="relative z-10 text-center p-8">
                      <GraduationCap className="w-24 h-24 text-[#FF6B00]/60 mx-auto mb-6" />
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { v: "20+", l: "Courses" },
                          { v: "5K+", l: "Learners" },
                          { v: "95%", l: "Success" },
                          { v: "5+", l: "Years" },
                        ].map((s) => (
                          <div key={s.l} className="bg-white/5 border border-white/10 p-4">
                            <div className="text-2xl font-black text-white">{s.v}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
                {/* Accent corner */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-4 border-b-4 border-[#FF6B00]" />
                <div className="absolute -top-4 -left-4 w-16 h-16 border-l-4 border-t-4 border-[#FF6B00]" />
              </div>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FIND PROGRAM ═══════════════════ */}
      <section id="programs" className="py-24 bg-[#0f0f1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255,107,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="container mx-auto px-4 md:px-16 relative z-10">
          <FadeUp className="text-center max-w-3xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-0.5 bg-[#FF6B00]" />
              <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">Explore</span>
              <div className="w-8 h-0.5 bg-[#FF6B00]" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-6">Find Your Learning Path</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Browse our curated courses and intensive tracks — built for working professionals who want to grow, pivot, or deepen their expertise at their own pace.
            </p>
          </FadeUp>

          <FadeUp delay={0.2} className="max-w-2xl mx-auto mb-10">
            <div className="flex border border-white/15 bg-white/5 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Search courses, tracks, skills, topics..."
                className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button className="bg-[#FF6B00] hover:bg-[#E56000] transition-colors duration-300 px-6 flex items-center gap-2 font-bold text-xs tracking-wider text-white">
                <Search className="w-4 h-4" /> SEARCH
              </button>
            </div>
          </FadeUp>

          <FadeUp delay={0.3} className="flex flex-wrap justify-center gap-2">
            <span className="text-slate-500 text-xs py-1.5 mr-1">Popular:</span>
            {['ArtificialIntelligence', 'DataScience', 'TechBootcamp', 'FullStackDevelopment', 'MERNStack', 'UgandaTech'].map(tag => (
              <button key={tag} className="border border-white/15 text-slate-400 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all duration-300 px-4 py-1.5 text-xs">
                #{tag}
              </button>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ DIPLOMA PROGRAMS ═══════════════════ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <FadeUp>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">Advanced Tracks</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0f0f1a]">Deep-Dive Learning Tracks</h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <a href="#" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#FF6B00] transition-colors border-b border-slate-300 hover:border-[#FF6B00] pb-0.5">
                View All Tracks <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </FadeUp>
          </div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200">
            {DIPLOMA_PROGRAMS.map((program, idx) => {
              const Icon = program.icon;
              return (
                <StaggerItem key={idx}>
                  <motion.div
                    className="group relative overflow-hidden bg-white border-r border-slate-200 last:border-r-0 h-full cursor-pointer"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-8 flex flex-col h-full">
                      {/* Icon */}
                      <motion.div
                        className="w-12 h-12 bg-[#FF6B00] flex items-center justify-center mb-6 text-white"
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>

                      <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-2">{program.category}</span>
                      <h3 className="text-base font-black text-[#0f0f1a] mb-6 leading-snug group-hover:text-[#FF6B00] transition-colors duration-300">{program.title}</h3>

                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {program.duration}</span>
                        <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Online</span>
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-[#FF6B00] w-0 group-hover:w-full transition-all duration-500"
                    />
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ BOOTCAMPS ═══════════════════ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-16">
          <div className="text-center mb-16">
            <FadeUp>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">Intensive Learning</span>
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0f0f1a] mb-4">Intensive Bootcamps</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">Fast-track your next skill with our hands-on, project-driven intensive programs — complete in weeks, not years.</p>
            </FadeUp>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
            {BOOTCAMPS.map((bootcamp, idx) => {
              const Icon = bootcamp.icon;
              return (
                <StaggerItem key={idx}>
                  <motion.div
                    className="group bg-white p-7 flex flex-col h-full cursor-pointer relative overflow-hidden"
                    whileHover={{ backgroundColor: "#0f0f1a" }}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.div
                      className="w-10 h-10 border border-slate-200 flex items-center justify-center text-[#FF6B00] mb-5 group-hover:border-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-350"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#FF6B00] transition-colors duration-300 mb-2">{bootcamp.weeks}</span>
                    <h3 className="text-sm font-black text-[#0f0f1a] group-hover:text-white transition-colors duration-300 mb-4 leading-snug">{bootcamp.title}</h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-400 transition-colors duration-300 mb-6">Hands-on program built around real-world projects and immediate career application.</p>

                    <a href="#" className="mt-auto inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] group-hover:text-white transition-colors duration-300 uppercase tracking-wider">
                      Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Number watermark */}
                    <div className="absolute -bottom-2 -right-2 text-7xl font-black text-slate-50 group-hover:text-white/5 transition-colors duration-300 select-none pointer-events-none leading-none">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ PROFESSIONAL + NEWS ═══════════════════ */}
      <section className="py-24 bg-[#0f0f1a] text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-px h-full bg-[#FF6B00]/20" />
        <div className="container mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-2 gap-20">

            <SlideInLeft>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">Certification Prep</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-10">Professional Upskilling</h2>

              <motion.div
                className="border border-white/10 p-7 hover:border-[#FF6B00]/50 transition-all duration-400 group cursor-pointer"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#FF6B00] flex items-center justify-center shrink-0">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-2 block">Certification Prep</span>
                    <h3 className="text-base font-black mb-3 group-hover:text-[#FF6B00] transition-colors">Certified Ethical Hacker (CEH v12)</h3>
                    <p className="text-slate-400 text-xs mb-5 leading-relaxed">Master advanced hacking techniques and security tools used by top-tier professionals worldwide.</p>
                    <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase tracking-wider hover:gap-4 transition-all">
                      Start Learning <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </SlideInLeft>

            <SlideInRight delay={0.15} id="news">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] text-xs font-bold uppercase tracking-[4px]">Updates</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-8">Latest News</h2>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Career', 'Community', 'Scholarships', 'Uncategorized'].map(cat => (
                  <span key={cat} className="border border-white/10 text-slate-400 text-xs px-4 py-1.5 hover:border-[#FF6B00] hover:text-[#FF6B00] cursor-pointer transition-all duration-300">
                    {cat}
                  </span>
                ))}
              </div>

              <motion.div
                className="border border-white/10 group cursor-pointer hover:border-[#FF6B00]/50 transition-all duration-400"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-40 bg-gradient-to-br from-[#1a1a3e] to-[#FF6B00]/20 flex items-center justify-center overflow-hidden relative">
                  <Cloud className="w-16 h-16 text-[#FF6B00]/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Jan 21, 2026</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 min read</span>
                  </div>
                  <h3 className="text-base font-black mb-3 group-hover:text-[#FF6B00] transition-colors leading-snug">Free 2-Day Cloud Computing Bootcamp in Uganda</h3>
                  <p className="text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">Join us for an intensive 2-day workshop covering AWS fundamentals and cloud architecture tailored for the African tech ecosystem.</p>
                  <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#FF6B00] transition-colors uppercase tracking-wider">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* ═══════════════════ DIRECTORY ═══════════════════ */}
      <section className="py-0 bg-white border-b border-slate-200">
        <StaggerContainer className="container mx-auto px-4 md:px-16 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {[
            { title: "Learner News", desc: "Stay updated with the latest from the Zentrix learning community." },
            { title: "Learning Calendar", desc: "Upcoming cohort launches, live sessions, and deadlines." },
            { title: "Events & Webinars", desc: "Free workshops, masterclasses, and networking sessions." },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <motion.div
                className="group p-10 flex flex-col gap-3 cursor-pointer hover:bg-[#FF6B00] transition-all duration-400"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-base font-black text-[#0f0f1a] group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 group-hover:text-white/80 transition-colors leading-relaxed">{item.desc}</p>
                <ArrowRight className="w-4 h-4 text-[#FF6B00] group-hover:text-white transition-colors mt-2" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-[#0a0a14] text-slate-300 pt-20 pb-8 border-t-4 border-[#FF6B00]">
        <div className="container mx-auto px-4 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <FadeUp className="col-span-1">
              <img src="https://zati.africa/wp-content/uploads/2024/10/zentrix-logo-.svg" alt="ZATI Logo" className="h-12 mb-6 opacity-90" />
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Zentrix is Africa's leading continuous learning platform — empowering professionals and learners to grow their skills, advance their careers, and thrive in the digital economy.
              </p>
              <div className="flex items-center gap-2">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all duration-300">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h4 className="text-xs font-black text-white mb-6 uppercase tracking-[3px]">Quick Links</h4>
              <ul className="space-y-3">
                {['Home', 'About', 'All Courses', 'Enroll', 'Community'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-[#FF6B00] transition-colors text-xs flex items-center gap-2 group">
                      <span className="w-3 h-px bg-slate-600 group-hover:w-5 group-hover:bg-[#FF6B00] transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </FadeUp>

            <FadeUp delay={0.2}>
              <h4 className="text-xs font-black text-white mb-6 uppercase tracking-[3px]">Resources</h4>
              <ul className="space-y-3">
                {['News', 'Events', 'Careers', 'Learning Calendar', 'Contact Us'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-[#FF6B00] transition-colors text-xs flex items-center gap-2 group">
                      <span className="w-3 h-px bg-slate-600 group-hover:w-5 group-hover:bg-[#FF6B00] transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </FadeUp>

            <FadeUp delay={0.3}>
              <h4 className="text-xs font-black text-white mb-6 uppercase tracking-[3px]">Contact Info</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span className="text-slate-500">Kampala, Uganda<br />Online Campus - Africa Wide</span>
                </li>
                <li className="flex items-center gap-3 text-xs">
                  <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <a href="tel:+256414673086" className="text-slate-500 hover:text-white transition-colors">+243 999371251</a>
                </li>
                <li className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <a href="mailto:info@zentrix.africa" className="text-slate-500 hover:text-white transition-colors">info@zentrix.africa</a>
                </li>
              </ul>
            </FadeUp>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs">
              &copy; {new Date().getFullYear()} Zentrix Africa Technology Institute (Zentrix). All Rights Reserved.
            </p>
            <div className="flex gap-6 text-xs text-slate-600">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
