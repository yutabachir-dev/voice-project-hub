import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mic, Sparkles, Users, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { categoriesQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOICE OFF — Trouvez la voix de votre projet" },
      {
        name: "description",
        content:
          "Publicité, communication institutionnelle ou promotion : choisissez votre projet, préparez votre script et commandez une voix off professionnelle.",
      },
      { property: "og:title", content: "VOICE OFF — Trouvez la voix de votre projet" },
      {
        property: "og:description",
        content:
          "Choisissez votre projet, préparez votre script et trouvez la voix professionnelle qui vous correspond.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    num: "01",
    title: "Choisissez votre projet",
    text: "Publicitaire, institutionnel ou promotionnel.",
    icon: Mic,
  },
  {
    num: "02",
    title: "Préparez votre script",
    text: "Ajoutez votre script ou laissez notre assistant vous aider à le créer.",
    icon: Sparkles,
  },
  {
    num: "03",
    title: "Choisissez votre voix",
    text: "Découvrez les profils de nos voice-over et regardez leur vidéo de présentation.",
    icon: Users,
  },
  {
    num: "04",
    title: "Passez votre commande",
    text: "Validez votre projet et soyez mis en relation avec le voice-over sélectionné.",
    icon: CheckCircle2,
  },
];

function Landing() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const active = categories.filter((c) => c.is_active);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 hidden size-96 rounded-full bg-primary/20 blur-3xl md:block" />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="fade-up space-y-8">
              <span className="step-eyebrow inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5">
                <span className="size-1.5 rounded-full bg-primary" /> Voice off school
              </span>
              <h1 className="text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
                Trouvez la voix qui donnera vie à votre projet.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Publicité, communication institutionnelle ou promotion : choisissez votre projet,
                préparez votre script et trouvez la voix professionnelle qui vous correspond.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/commande/$slug" params={{ slug: "publicitaire" }}>
                    Commencer mon projet <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/voix">Découvrir les voix</Link>
                </Button>
              </div>
            </div>

            <div className="fade-up ink-panel relative overflow-hidden rounded-3xl p-8">
              <div className="absolute -bottom-16 -left-10 size-56 rounded-full bg-primary/25 blur-2xl" />
              <div className="relative space-y-6">
                <p className="text-sm uppercase tracking-[0.2em] text-primary">Studio</p>
                <p className="font-display text-2xl leading-snug">
                  Des comédiens voix off professionnels, sélectionnés et accompagnés par VOICE OFF
                  SCHOOL.
                </p>
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                  {[
                    ["3", "catégories"],
                    ["10+", "styles de voix"],
                    ["100%", "humain"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <p className="font-display text-2xl text-primary">{v}</p>
                      <p className="text-xs text-ink-muted">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl space-y-3">
            <p className="step-eyebrow">Comment ça marche</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Quatre étapes, c'est tout.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="surface-card p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-muted-foreground">{s.num}</span>
                  <s.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl space-y-3">
            <p className="step-eyebrow">Nos services</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Choisissez le type de projet.</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {active.map((c) => (
              <div key={c.id} className="surface-card flex flex-col p-7">
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {c.examples.map((e) => (
                    <li key={e} className="flex items-start gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {e}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full">
                  <Link to="/commande/$slug" params={{ slug: c.slug }}>
                    Choisir {c.name.replace("Voice-over ", "")}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
