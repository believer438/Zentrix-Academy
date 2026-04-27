import { type ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  icon?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  icon,
  eyebrow,
  children,
}: PageHeroProps) {
  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/96 via-slate-950/78 to-slate-900/18" />
      <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[linear-gradient(270deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.16)_38%,transparent_100%)] mix-blend-screen lg:block" />
      <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.32),transparent_72%)] lg:block" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#FF6B00]" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[#FF6B00]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-8 hidden h-24 w-24 rounded-full border border-white/20 bg-white/10 blur-2xl lg:block" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-6 py-14 md:py-16 lg:max-w-[88rem] lg:py-20">
        {eyebrow && (
          <span className="mb-4 inline-flex w-fit items-center gap-2 border-l-2 border-[#FF6B00] bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FFB347] backdrop-blur">
            {eyebrow}
          </span>
        )}
        <div className="flex max-w-3xl items-start gap-4 lg:max-w-[58%]">
          {icon && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
