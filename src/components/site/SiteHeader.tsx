import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="font-display inline-flex items-baseline gap-1.5 text-lg font-bold tracking-tight">
      <span className={light ? "text-ink-foreground" : "text-foreground"}>VOICE</span>
      <span className="rounded-md bg-primary px-1.5 text-primary-foreground">OFF</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            School
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/voix"
            className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Les voix
          </Link>
          <Button asChild size="sm">
            <Link to="/commande/$slug" params={{ slug: "publicitaire" }}>
              Commencer mon projet
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="ink-panel mt-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo light />
          <p className="max-w-sm text-sm text-ink-muted">
            Le studio qui vous accompagne pour trouver la voix professionnelle de votre projet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          <Link to="/voix" className="transition-colors hover:text-primary">
            Découvrir les voix
          </Link>
          <Link to="/auth" className="transition-colors hover:text-primary">
            Espace VOICE OFF SCHOOL
          </Link>
        </div>
      </div>
    </footer>
  );
}
