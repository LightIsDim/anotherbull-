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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PhotoUploader from "@/components/common/PhotoUploader";
import AttachmentUploader from "@/components/common/AttachmentUploader";
import { PROJEK_CATEGORIES } from "@/lib/constants";
import type { Attachment, Project, ProjectInput } from "@/types";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Project | null;
}

export default function ProjectFormDialog({ open, onOpenChange, initial }: ProjectFormDialogProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(PROJEK_CATEGORIES[0]);
  const [date, setDate] = useState("");
  const [team, setTeam] = useState("");
  const [tech, setTech] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setCategory(initial?.category ?? PROJEK_CATEGORIES[0]);
      setDate(initial?.date ?? "");
      setTeam(initial?.team ?? "");
      setTech(initial?.tech.join(", ") ?? "");
      setDescription(initial?.description ?? "");
      setPhotos(initial?.photos ?? []);
      setAttachments(initial?.attachments ?? []);
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: ProjectInput = {
        title: title.trim(),
        description,
        date,
        category,
        team: team.trim(),
        tech: tech
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        photos,
        attachments,
      };
      return initial
        ? apiPut<Project>(`/projects/${initial.id}`, payload)
        : apiPost<Project>("/projects", payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(initial ? "Projek diperbarui" : "Projek ditambahkan");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto p-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Projek" : "Tambah Projek"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul-projek">Nama / judul projek</Label>
            <Input
              id="judul-projek"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Instalasi Jaringan LAN Lab"
              data-testid="input-judul-projek"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori projek</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full" data-testid="select-kategori-projek">
                  <SelectValue>{(v: string) => v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROJEK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal-projek">Tanggal pembuatan</Label>
              <Input
                id="tanggal-projek"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-tanggal-projek"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tim-projek">Nama anggota / tim pembuat</Label>
            <Input
              id="tim-projek"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="cth. Divisi Jaringan — Fajar, Diaz"
              data-testid="input-tim-projek"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teknologi-projek">Teknologi / perangkat (pisahkan dengan koma)</Label>
            <Input
              id="teknologi-projek"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="cth. MikroTik, RouterOS 7, Winbox"
              data-testid="input-teknologi-projek"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-projek">Deskripsi projek</Label>
            <Textarea
              id="deskripsi-projek"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              data-testid="input-deskripsi-projek"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto dokumentasi projek</Label>
            <PhotoUploader value={photos} onChange={setPhotos} multiple />
          </div>
          <div className="space-y-2">
            <Label>File pendukung</Label>
            <AttachmentUploader value={attachments} onChange={setAttachments} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="btn-cancel-projek">
            Batal
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !title.trim()}
            data-testid="btn-save-projek"
          >
            {save.isPending && <Loader2 className="animate-spin" />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
