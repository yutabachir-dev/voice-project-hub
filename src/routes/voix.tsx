import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { VoiceCard } from "@/components/site/VoiceCard";
import { Button } from "@/components/ui/button";
import {
  artistCategoriesQuery,
  artistStylesQuery,
  artistsQuery,
  categoriesQuery,
  stylesQuery,
} from "@/lib/catalog";

export const Route = createFileRoute("/voix")({
  head: () => ({
    meta: [
      { title: "Nos voix off professionnelles — VOICE OFF" },
      {
        name: "description",
        content:
          "Découvrez les comédiens voix off de VOICE OFF SCHOOL : profils, styles, langues et vidéos de présentation.",
      },
      { property: "og:title", content: "Nos voix off professionnelles — VOICE OFF" },
      {
        property: "og:description",
        content: "Profils, styles, langues et vidéos de présentation de nos comédiens voix off.",
      },
    ],
  }),
  component: VoicesPage,
});

function VoicesPage() {
  const { data: artists = [], isLoading } = useQuery(artistsQuery);
  const { data: styles = [] } = useQuery(stylesQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: artistStyles = [] } = useQuery(artistStylesQuery);
  const { data: artistCategories = [] } = useQuery(artistCategoriesQuery);

  const [gender, setGender] = useState<string>("Tous");
  const [categorySlug, setCategorySlug] = useState<string>("Toutes");

  const styleName = useMemo(() => new Map(styles.map((s) => [s.id, s.name])), [styles]);
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const visible = artists.filter((a) => {
    if (!a.is_active) return false;
    if (gender !== "Tous" && a.gender !== gender) return false;
    if (categorySlug !== "Toutes") {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (!cat) return false;
      if (!artistCategories.some((l) => l.artist_id === a.id && l.category_id === cat.id))
        return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <p className="step-eyebrow">Nos talents</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Découvrez nos voice-over.</h1>
          <p className="text-muted-foreground">
            Regardez leur vidéo de présentation et repérez la voix qui correspond à votre projet.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Tous", "Voix féminine", "Voix masculine"].map((g) => (
            <Button
              key={g}
              size="sm"
              variant={gender === g ? "default" : "subtle"}
              onClick={() => setGender(g)}
            >
              {g}
            </Button>
          ))}
          <span className="mx-2 hidden w-px bg-border sm:block" />
          {["Toutes", ...categories.filter((c) => c.is_active).map((c) => c.slug)].map((slug) => (
            <Button
              key={slug}
              size="sm"
              variant={categorySlug === slug ? "default" : "subtle"}
              onClick={() => setCategorySlug(slug)}
              className="capitalize"
            >
              {slug}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-12 text-muted-foreground">Chargement des profils…</p>
        ) : visible.length === 0 ? (
          <p className="mt-12 text-muted-foreground">
            Aucun profil ne correspond à ces critères pour le moment.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => (
              <VoiceCard
                key={a.id}
                artist={a}
                styles={artistStyles
                  .filter((l) => l.artist_id === a.id)
                  .map((l) => styleName.get(l.style_id) ?? "")
                  .filter(Boolean)}
                categories={artistCategories
                  .filter((l) => l.artist_id === a.id)
                  .map((l) => categoryName.get(l.category_id) ?? "")
                  .filter(Boolean)}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
