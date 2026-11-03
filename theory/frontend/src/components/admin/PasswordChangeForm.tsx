import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Turns FastAPI error bodies ({detail: ... | [{msg: ...}]}) into a readable toast.
function errorText(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object" && "detail" in err.body) {
    const detail: unknown = (err.body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (typeof d === "object" && d !== null && "msg" in d ? String((d as { msg: unknown }).msg) : String(d)))
        .join(", ");
    }
  }
  return err instanceof Error ? err.message : "Gagal mengganti password";
}

export default function PasswordChangeForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const change = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      toast.success("Password admin berhasil diganti — gunakan password baru pada login berikutnya");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    },
    onError: (err) => toast.error(errorText(err)),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }
    change.mutate();
  }

  return (
    <section className="max-w-2xl rounded-xl border border-border/70 bg-card/50 p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-cyan-300" />
        <h2 className="font-heading text-lg font-semibold">Ganti Password Admin</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Password baru minimal 8 karakter. Sesi yang sedang aktif tetap berlaku.
      </p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="old-password">Password lama</Label>
          <Input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
            data-testid="input-old-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">Password baru</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            data-testid="input-new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Ulangi password baru</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            data-testid="input-confirm-password"
          />
        </div>
        <Button
          type="submit"
          disabled={change.isPending}
          data-testid="btn-change-password"
        >
          {change.isPending && <Loader2 className="animate-spin" />} Ganti Password
        </Button>
      </form>
    </section>
  );
}
