import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { predictPrice, SUGGESTED_LOCATIONS, formatINR } from "@/lib/predict";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/predict")({
  head: () => ({ meta: [{ title: "Predict price — Estiva" }] }),
  component: PredictPage,
});

function PredictPage() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useState("Whitefield");
  const [area, setArea] = useState(1200);
  const [bedrooms, setBd] = useState(2);
  const [bathrooms, setBa] = useState(2);
  const [result, setResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const predicted_price = predictPrice({ location, area, bedrooms, bathrooms });
    setResult(predicted_price);
    const { error } = await supabase.from("predictions").insert({
      user_id: user.id, location, area, bedrooms, bathrooms, predicted_price,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved to your history");
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <Sparkles className="h-3.5 w-3.5" /> Linear regression model
      </div>
      <h1 className="mt-4 font-display text-4xl">Predict a property price</h1>
      <p className="mt-1 text-muted-foreground">Enter property details and get an instant estimate.</p>

      <Card className="mt-8 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} required list="locs" />
            <datalist id="locs">{SUGGESTED_LOCATIONS.map(l => <option key={l} value={l} />)}</datalist>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Area (sqft)</Label><Input type="number" min={100} value={area} onChange={e => setArea(+e.target.value)} required /></div>
            <div><Label>Bedrooms</Label><Input type="number" min={0} max={20} value={bedrooms} onChange={e => setBd(+e.target.value)} required /></div>
            <div><Label>Bathrooms</Label><Input type="number" min={0} max={20} value={bathrooms} onChange={e => setBa(+e.target.value)} required /></div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Predicting…" : "Predict price"}</Button>
        </form>
      </Card>

      {result !== null && (
        <Card className="mt-6 overflow-hidden">
          <div className="bg-[var(--gradient-hero)] p-8 text-primary-foreground">
            <p className="text-xs uppercase tracking-widest opacity-80">Predicted market value</p>
            <p className="mt-2 font-display text-6xl font-semibold">{formatINR(result)}</p>
            <p className="mt-2 text-sm opacity-80">{location} • {area} sqft • {bedrooms}BHK • {bathrooms} bath</p>
          </div>
        </Card>
      )}
    </main>
  );
}
