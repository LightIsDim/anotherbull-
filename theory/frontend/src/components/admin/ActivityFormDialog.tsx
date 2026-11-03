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
import { KEGIATAN_CATEGORIES } from "@/lib/constants";
import type { Activity, ActivityInput } from "@/types";

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Activity | null;
}

export default function ActivityFormDialog({ open, onOpenChange, initial }: ActivityFormDialogProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setCategory(initial?.category ?? "");
      setDate(initial?.date ?? "");
      setDescription(initial?.description ?? "");
      setPhotos(initial?.photos ?? []);
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: ActivityInput = {
        title: title.trim(),
        description,
        date,
        category: category.trim() || "Kegiatan",
        photos,
      };
      return initial
        ? apiPut<Activity>(`/activities/${initial.id}`, payload)
        : apiPost<Activity>("/activities", payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(initial ? "Kegiatan diperbarui" : "Kegiatan ditambahkan");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto p-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul-kegiatan">Judul kegiatan</Label>
            <Input
              id="judul-kegiatan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Workshop Instalasi LAN"
              data-testid="input-judul-kegiatan"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kategori-kegiatan">Kategori</Label>
              <Input
                id="kategori-kegiatan"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="kegiatan-category-options"
                placeholder="Workshop"
                data-testid="input-kategori-kegiatan"
              />
              <datalist id="kegiatan-category-options">
                {KEGIATAN_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal-kegiatan">Tanggal pelaksanaan</Label>
              <Input
                id="tanggal-kegiatan"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-tanggal-kegiatan"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Keterangan</Label>
            <Textarea
              id="deskripsi-kegiatan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Ceritakan jalannya kegiatan..."
              data-testid="input-deskripsi-kegiatan"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto kegiatan</Label>
            <PhotoUploader value={photos} onChange={setPhotos} multiple />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="btn-cancel-kegiatan">
            Batal
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !title.trim()}
            data-testid="btn-save-kegiatan"
          >
            {save.isPending && <Loader2 className="animate-spin" />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
