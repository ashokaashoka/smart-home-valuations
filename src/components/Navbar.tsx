import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, topRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";

export function Navbar() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const role = topRole(roles);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--gradient-hero)] text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">Estiva</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart Pricing</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/properties" className="text-sm font-medium hover:text-accent transition-colors">Properties</Link>
          <Link to="/predict" className="text-sm font-medium hover:text-accent transition-colors">Predict</Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">Dashboard</Link>
              <Link to="/history" className="text-sm font-medium hover:text-accent transition-colors">History</Link>
              {(role === "agent" || role === "admin") && (
                <Link to="/properties/new" className="text-sm font-medium hover:text-accent transition-colors">Add Property</Link>
              )}
              {role === "admin" && (
                <Link to="/admin" className="text-sm font-medium hover:text-accent transition-colors">Admin</Link>
              )}
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                @{profile?.username} <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide">{role}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
