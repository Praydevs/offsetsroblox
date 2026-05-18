import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { toHpp } from "@/lib/format-offsets";

export const Route = createFileRoute("/api/public/offsets.hpp")({
  server: {
    handlers: {
      GET: async () => {
        const { data, error } = await supabaseAdmin
          .from("offsets")
          .select("*")
          .order("category")
          .order("sort_order")
          .order("name");
        if (error) return new Response(error.message, { status: 500 });
        return new Response(toHpp(data ?? []), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=30",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});