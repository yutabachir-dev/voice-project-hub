import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().max(160),
  phone: z.string().min(4).max(40),
  company: z.string().max(120).optional().nullable(),
  jobTitle: z.string().max(120).optional().nullable(),
  projectDescription: z.string().min(1).max(4000),
  categorySlug: z.string().min(1).max(60),
  script: z.string().min(1).max(20000),
  scriptSource: z.enum(["manuel", "ia"]),
  styleIds: z.array(z.string().uuid()).min(1).max(6),
  artistId: z.string().uuid(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: category, error: catError } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", data.categorySlug)
      .eq("is_active", true)
      .maybeSingle();
    if (catError) throw new Error(catError.message);
    if (!category) throw new Error("Catégorie introuvable");

    const { data: styles, error: styleError } = await supabaseAdmin
      .from("styles")
      .select("id, name")
      .in("id", data.styleIds);
    if (styleError) throw new Error(styleError.message);

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        job_title: data.jobTitle || null,
      })
      .select("id")
      .single();
    if (clientError) throw new Error(clientError.message);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        client_id: client.id,
        category_id: category.id,
        artist_id: data.artistId,
        style_ids: (styles ?? []).map((s) => s.id),
        style_names: (styles ?? []).map((s) => s.name),
        project_description: data.projectDescription,
        script: data.script,
        script_source: data.scriptSource,
      })
      .select("order_number")
      .single();
    if (orderError) throw new Error(orderError.message);

    return { orderNumber: order.order_number as string };
  });
