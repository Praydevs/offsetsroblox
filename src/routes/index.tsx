import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Check, Copy, Download, FileCode, Search, Activity } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listOffsets, type OffsetRow } from "@/lib/offsets.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roblox Internal Offsets — live registry" },
      { name: "description", content: "Live registry of Roblox internal offsets. Browse, copy, or download as .hpp." },
      { property: "og:title", content: "Roblox Internal Offsets" },
      { property: "og:description", content: "Live registry of Roblox internal offsets — .hpp download." },
    ],
  }),
  component: Index,
});

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="mono text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded border border-border/60 hover:border-primary/60 hover:bg-accent/40 transition"
      title="Copy address"
    >
      {done ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      {done ? "copied" : "copy"}
    </button>
  );
}

function Index() {
  const fetchOffsets = useServerFn(listOffsets);
  const { data, isLoading } = useQuery({
    queryKey: ["offsets"],
    queryFn: () => fetchOffsets(),
    refetchInterval: 30000,
  });
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const list = (data?.offsets ?? []) as OffsetRow[];
    const filtered = q.trim()
      ? list.filter((o) =>
          (o.name + " " + o.address + " " + o.category).toLowerCase().includes(q.toLowerCase()),
        )
      : list;
    const map = new Map<string, OffsetRow[]>();
    for (const o of filtered) {
      if (!map.has(o.category)) map.set(o.category, []);
      map.get(o.category)!.push(o);
    }
    return Array.from(map.entries());
  }, [data, q]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 py-14">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mono text-xs text-primary mb-6">
            <Activity className="h-3 w-3" />
            LIVE REGISTRY
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-primary to-primary-foreground/40 bg-clip-text text-transparent">
              Roblox
            </span>{" "}
            Internal Offsets
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            A live, copy-paste-friendly registry. Updated by admins, served as
            <span className="mono"> .hpp</span>.
          </p>

          {/* download cards */}
          <div className="mt-8 grid grid-cols-1 gap-3 max-w-md mx-auto">
            <a
              href="/api/public/offsets.hpp"
              className="group rounded-xl border border-border/60 bg-card/60 hover:border-primary/60 transition p-5 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="mono text-sm">offsets.hpp</div>
                    <div className="text-xs text-muted-foreground">C++ header file</div>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </a>
          </div>
        </section>

        {/* Search */}
        <div className="relative mb-6 max-w-xl mx-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search offsets by name, address, or category…"
            className="pl-9 mono"
          />
        </div>

        {/* List */}
        <section className="space-y-8">
          {isLoading && <p className="text-center text-muted-foreground mono text-sm">loading…</p>}
          {!isLoading && grouped.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border/60 rounded-xl">
              <p className="text-muted-foreground mono text-sm">No offsets yet.</p>
            </div>
          )}
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="mono text-xs uppercase tracking-wider text-muted-foreground">
                  {cat}
                </h2>
                <div className="flex-1 h-px bg-border/60" />
                <span className="mono text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card/40">
                {items.map((o, i) => (
                  <div
                    key={o.id}
                    className={`flex items-center gap-4 px-4 py-3 ${
                      i !== items.length - 1 ? "border-b border-border/40" : ""
                    } hover:bg-accent/30 transition`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="mono text-sm truncate">{o.name}</div>
                      {o.notes && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {o.notes}
                        </div>
                      )}
                    </div>
                    <div className="mono text-sm text-primary">{o.address}</div>
                    <CopyButton text={o.address} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-20 text-center mono text-xs text-muted-foreground">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + "/api/public/offsets.hpp");
              toast.success("API URL copied");
            }}
            className="hover:text-primary"
          >
            /api/public/offsets.hpp
          </button>
        </footer>
      </main>
    </div>
  );
}
