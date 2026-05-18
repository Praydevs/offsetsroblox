import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Terminal } from "lucide-react";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-10 bg-background/70">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="mono text-sm tracking-tight">
            <span className="text-primary">roblox</span>
            <span className="text-muted-foreground">/</span>
            <span>offsets</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {email && (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="mono">
                  <Shield className="h-4 w-4 mr-1.5" /> Admin
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="mono"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sign out
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}