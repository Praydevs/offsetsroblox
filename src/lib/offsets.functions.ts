import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OffsetRow = {
  id: string;
  name: string;
  address: string;
  category: string;
  notes: string | null;
  sort_order: number;
  updated_at: string;
  created_at: string;
};

export const listOffsets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("offsets")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return { offsets: (data ?? []) as OffsetRow[] };
});

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_:.\-> ]+$/),
  address: z.string().trim().min(1).max(64),
  category: z.string().trim().min(1).max(60).default("General"),
  notes: z.string().trim().max(500).nullable().optional(),
  sort_order: z.number().int().min(0).max(100000).default(0),
});

function assertAdmin(supabase: any, userId: string) {
  return supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
}

export const upsertOffset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: role } = await assertAdmin(context.supabase, context.userId);
    if (!role) throw new Error("Forbidden: admin only");
    const payload = { ...data, notes: data.notes ?? null };
    if (data.id) {
      const { error } = await supabaseAdmin.from("offsets").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("offsets").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteOffset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: role } = await assertAdmin(context.supabase, context.userId);
    if (!role) throw new Error("Forbidden: admin only");
    const { error } = await supabaseAdmin.from("offsets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await assertAdmin(context.supabase, context.userId);
    return { isAdmin: !!data };
  });