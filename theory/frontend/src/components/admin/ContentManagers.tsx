import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhotoUploader from "@/components/common/PhotoUploader";
import { FAKSI_SECTIONS } from "@/lib/constants";
import type { SiteContent } from "@/types";

// Dialog editor for the six admin-owned sections of "Tujuan dan Arah Perjuangan Teknisi TKJ".
export function FaksiEditorDialog({
  open,
  onOpenChange,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: SiteContent | null;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && content) {
      const next: Record<string, string> = {};
      for (const s of FAKSI_SECTIONS) next[s.key] = content.data[s.key] ?? "";
      setForm(next);
    }
  }, [open, content]);

  const save = useMutation({
    mutationFn: () => apiPut<SiteContent>("/content/faksi", { data: form }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["content"] });
      toast.success("Halaman tujuan faksi diperbarui");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto p-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tujuan &amp; Visi Faksi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {FAKSI_SECTIONS.map((s) => (
            <div key={s.key} className="space-y-2">
              <Label htmlFor={`faksi-${s.key}`}>{s.label}</Label>
              <Textarea
                id={`faksi-${s.key}`}
                value={form[s.key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [s.key]: e.target.value }))}
                rows={s.key === "misi" || s.key === "prinsip" ? 5 : 3}
                data-testid={`textarea-${s.key}`}
                placeholder="Tulis di sini..."
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="btn-cancel-tujuan">
            Batal
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="btn-save-tujuan">
            {save.isPending && <Loader2 className="animate-spin" />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Admin tab: overview of the six manifesto sections + edit entry.
export function TujuanManager() {
  const { data: content } = useQuery({
    queryKey: ["content", "faksi"],
    queryFn: () => apiGet<SiteContent>("/content/faksi"),
  });
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} data-testid="btn-edit-tujuan-admin">
          Edit Bagan Tujuan &amp; Visi
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {FAKSI_SECTIONS.map((s) => (
          <div key={s.key} className="rounded-lg border border-border/70 bg-card/50 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">{s.label}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {content?.data[s.key] || "— belum diisi —"}
            </p>
          </div>
        ))}
      </div>
      <FaksiEditorDialog open={open} onOpenChange={setOpen} content={content ?? null} />
    </div>
  );
}

const EMPTY_SETTINGS: Record<string, string> = {
  logo_url: "",
  description: "",
  instagram: "",
  youtube: "",
  whatsapp: "",
  email: "",
};

// Admin tab: logo, footer description, socials.
export function SettingsManager() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["content", "settings"],
    queryFn: () => apiGet<SiteContent>("/content/settings"),
  });
  const [form, setForm] = useState<Record<string, string>>(EMPTY_SETTINGS);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Sync once from the server; afterwards local edits win (refetches must not clobber typing).
    if (data && !syncedRef.current) {
      syncedRef.current = true;
      setForm({ ...EMPTY_SETTINGS, ...data.data });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => apiPut<SiteContent>("/content/settings", { data: form }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["content"] });
      toast.success("Pengaturan situs disimpan");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label>Logo komunitas (tampil di navbar &amp; footer)</Label>
        <PhotoUploader
          value={form.logo_url ? [form.logo_url] : []}
          onChange={(urls) => setForm((f) => ({ ...f, logo_url: urls[0] ?? "" }))}
          label="Unggah logo"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-description">Deskripsi komunitas (footer)</Label>
        <Textarea
          id="settings-description"
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          data-testid="input-description-settings"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-instagram">Instagram</Label>
          <Input
            id="settings-instagram"
            value={form.instagram ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
            placeholder="https://instagram.com/..."
            data-testid="input-instagram-settings"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-youtube">YouTube</Label>
          <Input
            id="settings-youtube"
            value={form.youtube ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, youtube: e.target.value }))}
            placeholder="https://youtube.com/@..."
            data-testid="input-youtube-settings"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-whatsapp">WhatsApp</Label>
          <Input
            id="settings-whatsapp"
            value={form.whatsapp ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
            placeholder="https://wa.me/628..."
            data-testid="input-whatsapp-settings"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="teknisitkj@sekolah.sch.id"
            data-testid="input-email-settings"
          />
        </div>
      </div>
      <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="btn-save-settings">
        {save.isPending && <Loader2 className="animate-spin" />} Simpan Pengaturan
      </Button>
    </div>
  );
}
