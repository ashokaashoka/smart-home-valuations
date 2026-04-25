import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, topRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/predict";
import { toast } from "sonner";
import { Trash2, Ban, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Estiva" }] }),
  component: Admin,
});

interface UserRow { id: string; name: string; username: string; blocked: boolean; }
interface PropRow { id: string; title: string; location: string; price: number; predicted_price: number | null; created_by: string; }

function Admin() {
  const { user, roles, loading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [props, setProps] = useState<PropRow[]>([]);
  const [predCount, setPredCount] = useState(0);

  const refresh = async () => {
    const [u, p, c] = await Promise.all([
      supabase.from("profiles").select("id,name,username,blocked").order("created_at", { ascending: false }),
      supabase.from("properties").select("id,title,location,price,predicted_price,created_by").order("created_at", { ascending: false }),
      supabase.from("predictions").select("id", { count: "exact", head: true }),
    ]);
    setUsers((u.data ?? []) as UserRow[]);
    setProps((p.data ?? []) as PropRow[]);
    setPredCount(c.count ?? 0);
  };

  useEffect(() => { if (user && topRole(roles) === "admin") refresh(); }, [user, roles]);

  if (loading) return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (topRole(roles) !== "admin") return <Navigate to="/dashboard" />;

  const toggleBlock = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").update({ blocked: !u.blocked }).eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success(u.blocked ? "Unblocked" : "Blocked");
    refresh();
  };

  const delUser = async (u: UserRow) => {
    if (!confirm(`Delete @${u.username}? This removes their profile.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("User profile deleted");
    refresh();
  };

  const delProp = async (id: string) => {
    if (!confirm("Delete property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl">Admin panel</h1>
      <p className="mt-1 text-muted-foreground">Manage users, listings, and view analytics.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Users" value={users.length.toString()} />
        <StatCard label="Properties" value={props.length.toString()} />
        <StatCard label="Predictions" value={predCount.toString()} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Users</h2>
        <Card className="mt-3 divide-y divide-border">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{u.name} <span className="text-muted-foreground">@{u.username}</span></div>
                {u.blocked && <span className="text-xs text-destructive">Blocked</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleBlock(u)} className="gap-1">
                  {u.blocked ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  {u.blocked ? "Unblock" : "Block"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => delUser(u)} className="gap-1 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Properties</h2>
        <Card className="mt-3 divide-y divide-border">
          {props.length === 0 && <div className="p-6 text-muted-foreground">No properties.</div>}
          {props.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  {p.location} • {formatINR(Number(p.price))}
                  {p.predicted_price ? ` • ML ${formatINR(Number(p.predicted_price))}` : ""}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => delProp(p.id)} className="gap-1 text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          ))}
        </Card>
      </section>
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
