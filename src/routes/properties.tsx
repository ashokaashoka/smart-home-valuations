import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "./index";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/properties")({
  head: () => ({ meta: [{ title: "Properties — Estiva" }] }),
  component: PropertiesPage,
});

interface Property {
  id: string; title: string; location: string; price: number;
  predicted_price: number | null; area: number; bedrooms: number; bathrooms: number;
}

function PropertiesPage() {
  const [props, setProps] = useState<Property[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    supabase.from("properties").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setProps((data ?? []) as Property[]));
  }, []);

  const filtered = props.filter(p =>
    !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.location.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">All properties</h1>
          <p className="mt-1 text-muted-foreground">{props.length} listings</p>
        </div>
        <Input placeholder="Search title or location…" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" />
      </div>
      {filtered.length === 0 ? (
        <Card className="grid place-items-center p-16 text-muted-foreground">No properties match.</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
  );
}
