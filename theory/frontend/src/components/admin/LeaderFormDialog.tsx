import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiPost, apiPut } from "@/lib/api";
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
import type { Leader, LeaderInput } from "@/types";

interface LeaderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Leader | null;
}

export default function LeaderFormDialog({ open, onOpenChange, initial }: LeaderFormDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [period, setPeriod] = useState("");
  const [order, setOrder] = useState("");
  const [duties, setDuties] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setPosition(initial?.position ?? "");
      setPeriod(initial?.period ?? "");
      setOrder(initial ? String(initial.order) : "0");
      setDuties(initial?.duties ?? "");
      setPhoto(initial?.photo ?? "");
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: LeaderInput = {
        name: name.trim(),
        position: position.trim(),
        period: period.trim(),
        order: Number(order) || 0,
        duties,
        photo,
      };
      return initial
        ? apiPut<Leader>(`/leaders/${initial.id}`, payload)
        : apiPost<Leader>("/leaders", payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaders"] });
      toast.success(initial ? "Pengurus diperbarui" : "Pengurus ditambahkan");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto p-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Pengurus" : "Tambah Pengurus"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama-pengurus">Nama pengurus</Label>
              <Input
                id="nama-pengurus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                data-testid="input-nama-pengurus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jabatan-pengurus">Jabatan / posisi</Label>
              <Input
                id="jabatan-pengurus"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="cth. Ketua, Sekretaris, Bendahara"
                data-testid="input-jabatan-pengurus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode-pengurus">Periode</Label>
              <Input
                id="periode-pengurus"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="cth. 2025 / 2026"
                data-testid="input-periode-pengurus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urutan-pengurus">Urutan bagan</Label>
              <Input
                id="urutan-pengurus"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0 = kepala bagan"
                data-testid="input-urutan-pengurus"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tugas-pengurus">Deskripsi tugas</Label>
            <Textarea
              id="tugas-pengurus"
              value={duties}
              onChange={(e) => setDuties(e.target.value)}
              rows={4}
              placeholder="Uraikan tanggung jawabnya..."
              data-testid="input-tugas-pengurus"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto pengurus</Label>
            <PhotoUploader value={photo ? [photo] : []} onChange={(urls) => setPhoto(urls[0] ?? "")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="btn-cancel-pengurus">
            Batal
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !name.trim() || !position.trim()}
            data-testid="btn-save-pengurus"
          >
            {save.isPending && <Loader2 className="animate-spin" />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
