import { useState } from "react";
import { Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Artist } from "@/lib/catalog";

type Props = {
  artist: Artist;
  styles: string[];
  categories: string[];
  selected?: boolean;
  onSelect?: () => void;
};

export function VoiceCard({ artist, styles, categories, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={`surface-card fade-up overflow-hidden ${
        selected ? "border-primary ring-2 ring-primary" : ""
      }`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {artist.photo_url ? (
          <img
            src={artist.photo_url}
            alt={`Portrait de ${artist.name}, ${artist.gender.toLowerCase()}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Photo à venir
          </div>
        )}
        {selected && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Check className="size-3" /> Sélectionné
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold">{artist.name}</h3>
          <p className="text-sm text-muted-foreground">
            {artist.gender} · {artist.languages.join(", ")}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{artist.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {styles.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full font-normal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Play /> Voir la présentation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{artist.name}</DialogTitle>
                <DialogDescription>
                  {artist.gender} · {artist.languages.join(", ")}
                </DialogDescription>
              </DialogHeader>
              {artist.video_url ? (
                <video
                  src={artist.video_url}
                  controls
                  playsInline
                  poster={artist.photo_url ?? undefined}
                  className="aspect-video w-full rounded-xl bg-muted"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                  Vidéo de présentation à venir
                </div>
              )}
              <p className="text-sm text-muted-foreground">{artist.description}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Styles : </span>
                  {styles.join(", ") || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Catégories : </span>
                  {categories.join(", ") || "—"}
                </p>
              </div>
              {onSelect && (
                <Button
                  onClick={() => {
                    onSelect();
                    setOpen(false);
                  }}
                >
                  Choisir cette voix
                </Button>
              )}
            </DialogContent>
          </Dialog>

          {onSelect && (
            <Button size="sm" variant={selected ? "secondary" : "default"} onClick={onSelect}>
              {selected ? "Voix choisie" : "Choisir cette voix"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
