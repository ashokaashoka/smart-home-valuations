import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Estiva" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setL] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[a-z0-9_]+$/i.test(username)) return toast.error("Username: letters, numbers, underscore only");
    setL(true);
    const { error } = await signUp(name.trim(), username, password, role);
    setL(false);
    if (error) return toast.error(error);
    toast.success("Account created");
    nav({ to: "/dashboard" });
  };

  return (
    <main className="container mx-auto grid place-items-center px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-3xl">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">No email needed. Just a username.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="n">Full name</Label>
            <Input id="n" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
          </div>
          <div>
            <Label htmlFor="u">Username</Label>
            <Input id="u" value={username} onChange={(e) => setU(e.target.value)} required minLength={3} maxLength={30} />
          </div>
          <div>
            <Label htmlFor="p">Password</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setP(e.target.value)} required minLength={6} />
          </div>
          <div>
            <Label>Account type</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["user", "agent"] as AppRole[]).map((r) => (
                <button type="button" key={r} onClick={() => setRole(r)}
                  className={`rounded-md border px-3 py-2 text-sm capitalize transition ${role === r ? "border-accent bg-accent/10 font-semibold" : "border-border hover:border-accent/50"}`}>
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Admins are assigned manually.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have an account? <Link to="/login" className="text-accent underline">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
