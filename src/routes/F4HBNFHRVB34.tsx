import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/F4HBNFHRVB34")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex,nofollow" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/admin" : "/auth" });
  },
  component: () => null,
});