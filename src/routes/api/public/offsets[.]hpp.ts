import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Row = { name: string; address: string; category: string };

function safeName(name: string) {
  return name.replace(/[^A-Za-z0-9_]/g, "_");
}

function toHpp(offsets: Row[]): string {
  const lines = [
    "// Roblox Internal Offsets",
    `// Generated: ${new Date().toISOString()}`,
    "#pragma once",
    "",
    "namespace Offsets {",
  ];
  const byCat = new Map<string, Row[]>();
  for (const o of offsets) {
    if (!byCat.has(o.category)) byCat.set(o.category, []);
    byCat.get(o.category)!.push(o);
  }
  for (const [cat, items] of byCat) {
    lines.push(`    // ${cat}`);
    for (const o of items) {
      lines.push(`    constexpr auto ${safeName(o.name)} = ${o.address};`);
    }
    lines.push("");
  }
  lines.push("}");
  return lines.join("\n");
}

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