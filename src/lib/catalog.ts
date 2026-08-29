import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  examples: string[];
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Style = {
  id: string;
  name: string;
  description: string;
  audio_url: string | null;
  is_active: boolean;
};

export type Artist = {
  id: string;
  name: string;
  gender: string;
  description: string;
  photo_url: string | null;
  video_url: string | null;
  languages: string[];
  audio_samples: string[];
  is_active: boolean;
};

export type OrderStatus = "nouvelle" | "confirmee" | "en_cours" | "terminee" | "annulee";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () =>
    unwrap<Category[]>(supabase.from("categories").select("*").order("sort_order")),
});

export const stylesQuery = queryOptions({
  queryKey: ["styles"],
  queryFn: () => unwrap<Style[]>(supabase.from("styles").select("*").order("name")),
});

export const artistsQuery = queryOptions({
  queryKey: ["artists"],
  queryFn: () => unwrap<Artist[]>(supabase.from("voice_over_artists").select("*").order("name")),
});

export const categoryStylesQuery = queryOptions({
  queryKey: ["category_styles"],
  queryFn: () =>
    unwrap<{ category_id: string; style_id: string }[]>(
      supabase.from("category_styles").select("*"),
    ),
});

export const artistStylesQuery = queryOptions({
  queryKey: ["voice_over_styles"],
  queryFn: () =>
    unwrap<{ artist_id: string; style_id: string }[]>(supabase.from("voice_over_styles").select("*")),
});

export const artistCategoriesQuery = queryOptions({
  queryKey: ["voice_over_categories"],
  queryFn: () =>
    unwrap<{ artist_id: string; category_id: string }[]>(
      supabase.from("voice_over_categories").select("*"),
    ),
});
