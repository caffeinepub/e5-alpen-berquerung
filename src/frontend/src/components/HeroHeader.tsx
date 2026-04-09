import { AuthButton } from "./AuthButton";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
}

export function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <header className="relative w-full overflow-hidden">
      {/* Auth button — top right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <AuthButton />
      </div>

      {/* Hero image */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full">
        <img
          src="/assets/generated/alpine-hero.dim_1200x400.jpg"
          alt="Alpenlandschaft mit Bergen und Wanderpfaden"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      </div>

      {/* Title block — overlaps image via negative margin */}
      <div className="relative -mt-24 sm:-mt-28 md:-mt-32 px-4 sm:px-8 pb-8 text-center">
        <div className="inline-block">
          {/* Decorative line above */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary opacity-60" />
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-primary opacity-80">
              Wandertagebuch
            </span>
            <div className="h-px w-12 bg-primary opacity-60" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-body font-medium tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
