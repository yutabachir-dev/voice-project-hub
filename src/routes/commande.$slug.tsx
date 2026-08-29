import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { VoiceCard } from "@/components/site/VoiceCard";
import {
  artistCategoriesQuery,
  artistStylesQuery,
  artistsQuery,
  categoriesQuery,
  categoryStylesQuery,
  stylesQuery,
} from "@/lib/catalog";
import { createOrder } from "@/lib/orders.functions";
import { askScriptAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/commande/$slug")({
  head: () => ({
    meta: [
      { title: "Commander une voix off — VOICE OFF" },
      {
        name: "description",
        content:
          "Préparez votre projet en quelques étapes : informations, script, style de voix et choix de votre voice-over.",
      },
      { property: "og:title", content: "Commander une voix off — VOICE OFF" },
      {
        property: "og:description",
        content: "Préparez votre projet en quelques étapes et commandez votre voix off.",
      },
    ],
  }),
  component: OrderWizard,
});

const STEP_LABELS = [
  "Projet",
  "Informations",
  "Script",
  "Style",
  "Voice-over",
  "Récapitulatif",
  "Commande",
];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  projectDescription: string;
  script: string;
  scriptSource: "manuel" | "ia";
  styleIds: string[];
  artistId: string;
};

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  projectDescription: "",
  script: "",
  scriptSource: "manuel",
  styleIds: [],
  artistId: "",
};

function OrderWizard() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const storageKey = `voice-off-order-${slug}`;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: styles = [] } = useQuery(stylesQuery);
  const { data: artists = [] } = useQuery(artistsQuery);
  const { data: categoryStyles = [] } = useQuery(categoryStylesQuery);
  const { data: artistStyles = [] } = useQuery(artistStylesQuery);
  const { data: artistCategories = [] } = useQuery(artistCategoriesQuery);

  const submitOrder = useServerFn(createOrder);

  const category = categories.find((c) => c.slug === slug);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        setForm({ ...EMPTY, ...(JSON.parse(saved) as Partial<FormState>) });
      } catch {
        /* ignore */
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form, storageKey]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const styleName = useMemo(() => new Map(styles.map((s) => [s.id, s.name])), [styles]);
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const availableStyles = useMemo(() => {
    if (!category) return [];
    const ids = new Set(
      categoryStyles.filter((l) => l.category_id === category.id).map((l) => l.style_id),
    );
    return styles.filter((s) => s.is_active && ids.has(s.id));
  }, [category, categoryStyles, styles]);

  const matchingArtists = useMemo(() => {
    if (!category) return [];
    const inCategory = artists.filter(
      (a) =>
        a.is_active &&
        artistCategories.some((l) => l.artist_id === a.id && l.category_id === category.id),
    );
    if (form.styleIds.length === 0) return inCategory;
    const scored = inCategory.map((a) => ({
      artist: a,
      score: artistStyles.filter((l) => l.artist_id === a.id && form.styleIds.includes(l.style_id))
        .length,
    }));
    return scored.sort((a, b) => b.score - a.score).map((s) => s.artist);
  }, [artists, artistCategories, artistStyles, category, form.styleIds]);

  const selectedArtist = artists.find((a) => a.id === form.artistId);

  function validateStep(current: number) {
    const e: Record<string, string> = {};
    if (current === 1) {
      if (!form.firstName.trim()) e['firstName'] = "Votre prénom est requis.";
      if (!form.lastName.trim()) e['lastName'] = "Votre nom est requis.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e['email'] = "Adresse email invalide.";
      if (form.phone.trim().length < 6) e['phone'] = "Numéro de téléphone invalide.";
      if (form.projectDescription.trim().length < 10)
        e['projectDescription'] = "Décrivez votre projet en quelques mots.";
    }
    if (current === 2 && form.script.trim().length < 10)
      e['script'] = "Votre script doit contenir au moins quelques phrases.";
    if (current === 3 && form.styleIds.length === 0) e['styleIds'] = "Choisissez au moins un style.";
    if (current === 4 && !form.artistId) e['artistId'] = "Choisissez un voice-over.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) {
      toast.error("Merci de compléter les champs indiqués.");
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!category) return;
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim() || null,
          jobTitle: form.jobTitle.trim() || null,
          projectDescription: form.projectDescription.trim(),
          categorySlug: slug,
          script: form.script.trim(),
          scriptSource: form.scriptSource,
          styleIds: form.styleIds,
          artistId: form.artistId,
        },
      });
      if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
      toast.success("Commande envoyée à VOICE OFF SCHOOL.");
      navigate({ to: "/confirmation/$orderNumber", params: { orderNumber: result.orderNumber } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La commande n'a pas pu être envoyée.");
      setSubmitting(false);
    }
  }

  if (categories.length > 0 && !category) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-bold">Ce type de projet n'est pas disponible.</h1>
          <Button asChild className="mt-6">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          <p className="step-eyebrow">
            Étape {step + 1} sur 7 — {STEP_LABELS[step]}
          </p>
          <div className="mt-4 flex gap-1.5">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-border"
                  }`}
                />
                <span className="mt-2 hidden text-[11px] text-muted-foreground sm:block">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        {step === 0 && category && (
          <section className="fade-up space-y-6">
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{category.description}</p>
            <div className="surface-card p-6">
              <p className="step-eyebrow">Exemples de projets</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {category.examples.map((ex) => (
                  <li key={ex} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.is_active && c.slug !== slug)
                .map((c) => (
                  <Button key={c.id} asChild variant="subtle" size="sm">
                    <Link to="/commande/$slug" params={{ slug: c.slug }}>
                      Plutôt {c.name.replace("Voice-over ", "")}
                    </Link>
                  </Button>
                ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="fade-up space-y-6">
            <h1 className="text-3xl font-bold">Vos informations</h1>
            <p className="text-muted-foreground">
              Ces informations permettent à VOICE OFF SCHOOL de vous recontacter.
            </p>
            <div className="surface-card grid gap-5 p-6 sm:grid-cols-2">
              <Field label="Prénom" error={errors['firstName']}>
                <Input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="Awa"
                />
              </Field>
              <Field label="Nom" error={errors['lastName']}>
                <Input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Sarr"
                />
              </Field>
              <Field label="Email" error={errors['email']}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </Field>
              <Field label="Téléphone" error={errors['phone']}>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+221 77 000 00 00"
                />
              </Field>
              <Field label="Nom de l'entreprise (optionnel)">
                <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
              </Field>
              <Field label="Fonction (optionnel)">
                <Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description du projet" error={errors['projectDescription']}>
                  <Textarea
                    rows={4}
                    value={form.projectDescription}
                    onChange={(e) => set("projectDescription", e.target.value)}
                    placeholder="Parlez-nous de votre projet en quelques lignes."
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <ScriptStep
            category={category?.name ?? ""}
            script={form.script}
            error={errors['script']}
            onScript={(value, source) => {
              set("script", value);
              set("scriptSource", source);
            }}
          />
        )}

        {step === 3 && (
          <section className="fade-up space-y-6">
            <h1 className="text-3xl font-bold">Quel style souhaitez-vous ?</h1>
            <p className="text-muted-foreground">
              Sélectionnez un ou plusieurs styles pour orienter l'interprétation.
            </p>
            {errors['styleIds'] && <p className="text-sm text-destructive">{errors['styleIds']}</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableStyles.map((s) => {
                const active = form.styleIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      set(
                        "styleIds",
                        active
                          ? form.styleIds.filter((id) => id !== s.id)
                          : [...form.styleIds, s.id],
                      )
                    }
                    className={`surface-card p-5 text-left ${active ? "border-primary ring-2 ring-primary" : ""}`}
                  >
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    {s.audio_url && (
                      <audio controls src={s.audio_url} className="mt-3 w-full">
                        <track kind="captions" />
                      </audio>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="fade-up space-y-6">
            <h1 className="text-3xl font-bold">Choisissez votre voix</h1>
            <p className="text-muted-foreground">
              Profils sélectionnés selon votre catégorie et vos styles.
            </p>
            {errors['artistId'] && <p className="text-sm text-destructive">{errors['artistId']}</p>}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchingArtists.map((a) => (
                <VoiceCard
                  key={a.id}
                  artist={a}
                  selected={form.artistId === a.id}
                  onSelect={() => set("artistId", a.id)}
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
          </section>
        )}

        {step === 5 && (
          <section className="fade-up space-y-6">
            <h1 className="text-3xl font-bold">Votre projet</h1>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="surface-card space-y-5 p-6">
                <Recap label="Type de projet" value={category?.name ?? ""} onEdit={() => setStep(0)} />
                <Recap
                  label="Client"
                  value={`${form.firstName} ${form.lastName}${form.company ? ` — ${form.company}` : ""}`}
                  hint={`${form.email} · ${form.phone}`}
                  onEdit={() => setStep(1)}
                />
                <Recap label="Script" value={form.script} multiline onEdit={() => setStep(2)} />
                <Recap
                  label="Style"
                  value={form.styleIds.map((id) => styleName.get(id)).join(", ")}
                  onEdit={() => setStep(3)}
                />
              </div>
              <div className="surface-card space-y-4 p-6">
                <p className="step-eyebrow">Voice-over</p>
                {selectedArtist ? (
                  <>
                    {selectedArtist.photo_url && (
                      <img
                        src={selectedArtist.photo_url}
                        alt={`Portrait de ${selectedArtist.name}`}
                        className="aspect-4/3 w-full rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{selectedArtist.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedArtist.gender}</p>
                    </div>
                    {selectedArtist.video_url && (
                      <video
                        src={selectedArtist.video_url}
                        controls
                        playsInline
                        poster={selectedArtist.photo_url ?? undefined}
                        className="aspect-video w-full rounded-xl bg-muted"
                      />
                    )}
                    <Button variant="outline" size="sm" onClick={() => setStep(4)}>
                      Modifier
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun voice-over sélectionné.</p>
                )}
              </div>
            </div>
            <Button size="lg" onClick={submit} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="animate-spin" /> : <Send />}
              Passer ma commande
            </Button>
          </section>
        )}

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            <ArrowLeft /> Retour
          </Button>
          {step < 5 && (
            <Button onClick={next}>
              Continuer <ArrowRight />
            </Button>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Recap({
  label,
  value,
  hint,
  multiline,
  onEdit,
}: {
  label: string;
  value: string;
  hint?: string;
  multiline?: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="min-w-0 space-y-1">
        <p className="step-eyebrow">{label}</p>
        <p className={`text-sm ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value || "—"}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Modifier
      </Button>
    </div>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function ScriptStep({
  category,
  script,
  error,
  onScript,
}: {
  category: string;
  script: string;
  error?: string | undefined;
  onScript: (value: string, source: "manuel" | "ia") => void;
}) {
  const [mode, setMode] = useState<"manuel" | "ia">("manuel");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askScriptAssistant);

  async function send() {
    const value = input.trim();
    if (!value || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: { category, messages: nextMessages, mode: "chat" } });
      setMessages([...nextMessages, { role: "assistant", content: res.content }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "L'assistant n'a pas pu répondre.");
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    if (messages.length === 0) {
      toast.error("Décrivez d'abord votre idée à l'assistant.");
      return;
    }
    setLoading(true);
    try {
      const res = await ask({ data: { category, messages, mode: "script" } });
      onScript(res.content, "ia");
      toast.success("Script généré, vous pouvez le modifier.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Le script n'a pas pu être généré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fade-up space-y-6">
      <h1 className="text-3xl font-bold">Votre script</h1>
      <div className="flex flex-wrap gap-2">
        <Button variant={mode === "manuel" ? "default" : "subtle"} onClick={() => setMode("manuel")}>
          J'ai déjà mon script
        </Button>
        <Button variant={mode === "ia" ? "default" : "subtle"} onClick={() => setMode("ia")}>
          <Sparkles /> Je n'ai pas encore de script
        </Button>
      </div>

      {mode === "ia" && (
        <div className="surface-card space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Décrivez-nous votre idée</h2>
            <p className="text-sm text-muted-foreground">
              Notre assistant vous aide à rédiger. L'enregistrement reste réalisé par un comédien
              voix off professionnel.
            </p>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl bg-muted/60 p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Exemple : « Je veux une publicité de 30 secondes pour mon restaurant Chez Fatou,
                cuisine sénégalaise, avec une promotion ce week-end. »
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-secondary text-secondary-foreground"
                    : "bg-background"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> L'assistant rédige…
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre idée ou répondez à la question…"
            />
            <div className="flex gap-2 sm:flex-col">
              <Button onClick={send} disabled={loading}>
                Envoyer
              </Button>
              <Button variant="secondary" onClick={generate} disabled={loading}>
                <RefreshCw /> Générer
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="surface-card space-y-3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Votre script</Label>
          {script && <Badge variant="secondary">{script.trim().split(/\s+/).length} mots</Badge>}
        </div>
        <Textarea
          rows={12}
          value={script}
          onChange={(e) => onScript(e.target.value, mode)}
          placeholder="Collez votre script ici"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Vous pourrez encore modifier ce texte avant de valider votre commande.
        </p>
      </div>
    </section>
  );
}
