import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/confirmation/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Commande enregistrée — VOICE OFF" },
      {
        name: "description",
        content: "Votre commande de voix off a bien été transmise à VOICE OFF SCHOOL.",
      },
      { property: "og:title", content: "Commande enregistrée — VOICE OFF" },
      {
        property: "og:description",
        content: "Votre commande de voix off a bien été transmise à VOICE OFF SCHOOL.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { orderNumber } = Route.useParams();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-20 sm:px-6">
        <div className="surface-card fade-up w-full p-8 text-center sm:p-12">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="size-7 text-primary-foreground" />
          </span>
          <h1 className="mt-6 text-3xl font-bold">Votre commande a bien été enregistrée.</h1>
          <p className="mt-4 text-muted-foreground">
            Votre demande a été transmise à VOICE OFF SCHOOL. Vous serez mis en relation avec le
            voice-over sélectionné afin de poursuivre les échanges concernant votre projet.
          </p>
          <p className="mt-8 rounded-xl bg-muted px-4 py-3 font-display text-sm">
            Numéro de commande : <strong>{orderNumber}</strong>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/voix">Découvrir les voix</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
