import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/predict";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Prediction history — Estiva" }] }),
  component: HistoryPage,
});

interface P {
  id: string; location: string; area: number; bedrooms: number;
  bathrooms: number; predicted_price: number; created_at: string;
}

function HistoryPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<P[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("predictions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as P[]));
  }, [user]);

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl">Your prediction history</h1>
      <p className="mt-1 text-muted-foreground">{items.length} prediction{items.length === 1 ? "" : "s"}</p>
      <div className="mt-8 space-y-3">
        {items.length === 0 && <Card className="grid place-items-center p-16 text-muted-foreground">No predictions yet.</Card>}
        {items.map(p => (
          <Card key={p.id} className="flex items-center justify-between p-5">
            <div>
              <div className="font-display text-xl">{p.location}</div>
              <div className="text-xs text-muted-foreground">
                {p.area} sqft • {p.bedrooms}BHK • {p.bathrooms} bath • {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-accent">Estimate</div>
              <div className="font-display text-2xl">{formatINR(Number(p.predicted_price))}</div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
