import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth, topRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { predictPrice, SUGGESTED_LOCATIONS, formatINR } from "@/lib/predict";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/new")({
  head: () => ({ meta: [{ title: "Add property — Estiva" }] }),
  component: NewProperty,
});

function NewProperty() {
  const { user, roles, loading } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState(1200);
  const [bedrooms, setBd] = useState(2);
  const [bathrooms, setBa] = useState(2);
  const [price, setPrice] = useState(8000000);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  const role = topRole(roles);
  if (role === "user") return <Navigate to="/dashboard" />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const predicted_price = predictPrice({ location, area, bedrooms, bathrooms });
    const { error } = await supabase.from("properties").insert({
      title, location, area, bedrooms, bathrooms, price, predicted_price, created_by: user.id,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Listed! ML estimate: ${formatINR(predicted_price)}`);
    nav({ to: "/properties" });
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl">List a property</h1>
      <p className="mt-1 text-muted-foreground">We'll attach an ML price estimate automatically.</p>
      <Card className="mt-8 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label htmlFor="t">Title</Label>
            <Input id="t" value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} placeholder="3BHK in Whitefield with garden" />
          </div>
          <div>
            <Label htmlFor="l">Location</Label>
            <Input id="l" value={location} onChange={e => setLocation(e.target.value)} required list="locs" placeholder="Whitefield" />
            <datalist id="locs">{SUGGESTED_LOCATIONS.map(l => <option key={l} value={l} />)}</datalist>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Area (sqft)</Label><Input type="number" min={100} value={area} onChange={e => setArea(+e.target.value)} required /></div>
            <div><Label>Bedrooms</Label><Input type="number" min={0} max={20} value={bedrooms} onChange={e => setBd(+e.target.value)} required /></div>
            <div><Label>Bathrooms</Label><Input type="number" min={0} max={20} value={bathrooms} onChange={e => setBa(+e.target.value)} required /></div>
          </div>
          <div>
            <Label>Asking price (₹)</Label>
            <Input type="number" min={100000} value={price} onChange={e => setPrice(+e.target.value)} required />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Publish listing"}</Button>
        </form>
      </Card>
    </main>
  );
}
