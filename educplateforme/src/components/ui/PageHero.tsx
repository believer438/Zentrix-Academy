import { type ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  icon,
  children,
}: PageHeroProps) {
  return (
    <div
      className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-6 md:px-8 lg:px-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            {icon && <div className="text-white">{icon}</div>}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-sm md:text-base text-white/90 max-w-xl">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
