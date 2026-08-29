import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(6000),
});

const inputSchema = z.object({
  category: z.string().max(80),
  messages: z.array(messageSchema).min(1).max(24),
  mode: z.enum(["chat", "script"]),
});

const SYSTEM = `Tu es l'assistant de rédaction de VOICE OFF SCHOOL, un studio professionnel de voice-over.
Tu aides un client à préparer le script d'une voix off. Tu parles français, de façon simple, humaine et rassurante.
Ne parle jamais de technique ni d'intelligence artificielle. Les voix sont enregistrées par de vrais comédiens voix off.`;

export const askScriptAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistant indisponible pour le moment.");

    const instruction =
      data.mode === "chat"
        ? `Projet : ${data.category}. Pose UNE seule question courte et utile à la fois (nom de l'entreprise, produit ou service, public cible, durée souhaitée, ton, message principal) pour compléter les informations manquantes. Dès que tu as assez d'éléments, réponds simplement : "J'ai tout ce qu'il me faut, je peux générer votre script."`
        : `Projet : ${data.category}. Rédige maintenant le script final de la voix off, prêt à être enregistré. Réponds UNIQUEMENT avec le texte du script, sans titre, sans commentaire, sans indication de mise en scène.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: `${SYSTEM}\n\n${instruction}` },
          ...data.messages,
        ],
      }),
    });

    if (response.status === 429) throw new Error("Trop de demandes, merci de réessayer dans un instant.");
    if (response.status === 402) throw new Error("Crédits épuisés pour l'assistant de rédaction.");
    if (!response.ok) throw new Error("L'assistant n'a pas pu répondre.");

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("L'assistant n'a pas pu répondre.");
    return { content };
  });
