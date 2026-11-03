import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { beginSession, useMe, type AdminUser } from "@/lib/session";

export default function Login() {
  const { data: me, isLoading } = useMe();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  if (!isLoading && me) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await apiPost<AdminUser>("/auth/login", { username, password });
      await beginSession();
      toast.success("Login berhasil. Selamat datang, admin!");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 401
          ? "Username atau password salah"
          : "Login gagal — coba beberapa saat lagi"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-[72svh] items-center justify-center px-4 py-16">
      <div className="tkj-grid-bg absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-red-500/25 bg-card/80 p-8 shadow-2xl backdrop-blur">
          <div className="tkj-stripe h-1 w-16 rounded-full" />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">
            Admin Access
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold">Login Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khusus pengelola faksi TEKNISI TKJ. Pengunjung tidak perlu login untuk
            melihat dokumentasi.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={pending}
              data-testid="btn-login"
            >
              {pending && <Loader2 className="animate-spin" />} Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
