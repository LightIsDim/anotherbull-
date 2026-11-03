import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import { useSettings } from "@/lib/hooks";
import { useMe } from "@/lib/session";
import { cn } from "@/lib/utils";

export function BrandMark({ logoUrl, className }: { logoUrl?: string; className?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo Teknisi TKJ"
        className={cn("size-9 rounded-lg object-cover ring-1 ring-red-500/40", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "relative grid size-9 place-items-center rounded-lg bg-gradient-to-br from-red-600 to-red-900 font-heading text-lg font-bold text-white ring-1 ring-red-500/50",
        className
      )}
    >
      T
      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-cyan-400" />
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const { data: settings } = useSettings();
  const logoUrl = settings?.data.logo_url;

  return (
    <header className="sticky top-0 z-40 border-b border-red-500/20 bg-background/85 backdrop-blur-xl">
      <div className="tkj-stripe h-0.5 w-full" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5">
          <BrandMark logoUrl={logoUrl} />
          <span className="font-heading text-lg font-bold tracking-tight">
            TEKNISI <span className="text-red-500">TKJ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive ? "text-cyan-300" : "text-muted-foreground hover:text-foreground"
                )
              }
              data-testid={`nav-link-${l.testid}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={me ? "/admin" : "/login"}
            data-testid="nav-admin-button"
            className={cn(
              buttonVariants({ variant: me ? "default" : "outline", size: "sm" }),
              "hidden h-9 sm:inline-flex"
            )}
          >
            <LayoutDashboard />
            {me ? "Dashboard" : "Admin"}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Buka menu"
                  data-testid="nav-toggle-button"
                  className="size-11 lg:hidden"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                Navigasi
              </SheetTitle>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                    data-testid={`nav-link-${l.testid}`}
                  >
                    {l.label}
                  </NavLink>
                ))}
                <Link
                  to={me ? "/admin" : "/login"}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  data-testid="nav-link-admin"
                >
                  <LayoutDashboard />
                  {me ? "Dashboard Admin" : "Login Admin"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
