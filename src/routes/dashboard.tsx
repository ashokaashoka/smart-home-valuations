import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, topRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/predict";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Estiva" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, roles, loading } = useAuth();
  const [stats, setStats] = useState({ properties: 0, predictions: 0, lastPrediction: 0 });
  const role = topRole(roles);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const props = role === "agent"
        ? await supabase.from("properties").select("id", { count: "exact", head: true }).eq("created_by", user.id)
        : { count: 0 };
      const preds = await supabase.from("predictions").select("predicted_price,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      const total = await supabase.from("predictions").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      setStats({
        properties: props.count ?? 0,
        predictions: total.count ?? 0,
        lastPrediction: preds.data?.[0]?.predicted_price ? Number(preds.data[0].predicted_price) : 0,
      });
    })();
  }, [user, role]);

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <main className="container mx-auto px-4 py-12">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">{role} dashboard</p>
        <h1 className="font-display text-4xl">Hello, {profile?.name?.split(" ")[0] ?? "friend"}.</h1>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Predictions made" value={stats.predictions.toString()} />
        <StatCard label="Last estimate" value={stats.lastPrediction ? formatINR(stats.lastPrediction) : "—"} />
        {role === "agent" ? (
          <StatCard label="Your listings" value={stats.properties.toString()} />
        ) : (
          <StatCard label="Account" value={role.toUpperCase()} />
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ActionCard title="Predict a price" desc="Get an instant ML estimate." href="/predict" cta="Try it" />
        <ActionCard title="Browse properties" desc="Explore current listings." href="/properties" cta="Browse" />
        {role === "user" && <ActionCard title="View history" desc="See past predictions." href="/history" cta="Open" />}
        {(role === "agent" || role === "admin") && <ActionCard title="Add property" desc="List a new property." href="/properties/new" cta="Add" />}
        {role === "admin" && <ActionCard title="Admin panel" desc="Manage users and listings." href="/admin" cta="Open" />}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </Card>
  );
}

function ActionCard({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <Card className="flex flex-col p-6">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
      <Button asChild variant="outline" className="mt-4 self-start"><Link to={href}>{cta}</Link></Button>
    </Card>
  );
}
