import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, TrendingUp, Building2 } from "lucide-react";
import { formatINR } from "@/lib/predict";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estiva — Smart Real Estate Price Prediction" },
      { name: "description", content: "Predict Bangalore property prices instantly. List, browse and manage real estate with ML-powered estimates." },
      { property: "og:title", content: "Estiva — Smart Real Estate Price Prediction" },
      { property: "og:description", content: "Predict property prices instantly with ML." },
    ],
  }),
  component: Index,
});

interface Property {
  id: string; title: string; location: string; price: number;
  predicted_price: number | null; area: number; bedrooms: number; bathrooms: number;
}

function Index() {
  const [featured, setFeatured] = useState<Property[]>([]);
  useEffect(() => {
    supabase.from("properties").select("*").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setFeatured((data ?? []) as Property[]));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> ML-powered pricing
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
              Know what your<br />property is <span className="italic text-accent">truly</span> worth.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Estiva predicts real-estate prices in seconds using a regression model trained on Bangalore housing data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/predict">Try a prediction <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/properties">Browse listings</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <Stat icon={<TrendingUp className="h-4 w-4" />} v="< 1s" l="Prediction" />
              <Stat icon={<Building2 className="h-4 w-4" />} v="20+" l="Locations" />
              <Stat icon={<Sparkles className="h-4 w-4" />} v="3" l="Roles" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--gradient-hero)] opacity-20 blur-3xl" />
            <img src={hero} alt="Modern homes at sunset" width={1536} height={1024} className="relative aspect-[3/2] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]" />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-4xl">Featured properties</h2>
              <p className="mt-2 text-muted-foreground">Latest listings from agents on Estiva.</p>
            </div>
            <Button asChild variant="ghost"><Link to="/properties">View all →</Link></Button>
          </div>
          {featured.length === 0 ? (
            <Card className="grid place-items-center p-16 text-muted-foreground">
              No properties yet. <Link to="/register" className="ml-2 underline">Become an agent</Link> to list one.
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon}{l}</div>
      <div className="mt-1 font-display text-2xl">{v}</div>
    </div>
  );
}

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-elegant)]">
      <div className="aspect-[4/3] bg-[var(--gradient-hero)] opacity-90 transition-transform group-hover:scale-105" />
      <div className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.location}</div>
        <h3 className="mt-1 font-display text-xl">{p.title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Listed</div>
            <div className="font-semibold">{formatINR(Number(p.price))}</div>
          </div>
          {p.predicted_price && (
            <div className="text-right">
              <div className="text-xs text-accent">ML estimate</div>
              <div className="font-semibold">{formatINR(Number(p.predicted_price))}</div>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{p.area} sqft</span><span>•</span>
          <span>{p.bedrooms} BHK</span><span>•</span>
          <span>{p.bathrooms} bath</span>
        </div>
      </div>
    </Card>
  );
}
