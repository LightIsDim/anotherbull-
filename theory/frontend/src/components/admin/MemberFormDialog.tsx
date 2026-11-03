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
import type { Member, MemberInput } from "@/types";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Member | null;
}

export default function MemberFormDialog({ open, onOpenChange, initial }: MemberFormDialogProps) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("Anggota");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    if (open) {
      setFullName(initial?.full_name ?? "");
      setNickname(initial?.nickname ?? "");
      setAngkatan(initial?.angkatan ?? "");
      setYear(initial?.year ? String(initial.year) : "");
      setStatus(initial?.status ?? "Anggota");
      setSkills(initial?.skills.join(", ") ?? "");
      setDescription(initial?.description ?? "");
      setPhoto(initial?.photo ?? "");
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: MemberInput = {
        full_name: fullName.trim(),
        nickname: nickname.trim(),
        angkatan: angkatan.trim(),
        year: Number(year) || 0,
        status: status.trim() || "Anggota",
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description,
        photo,
      };
      return initial
        ? apiPut<Member>(`/members/${initial.id}`, payload)
        : apiPost<Member>("/members", payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["members"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(initial ? "Data anggota diperbarui" : "Anggota ditambahkan");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto p-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Anggota" : "Tambah Anggota"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama-anggota">Nama lengkap</Label>
              <Input
                id="nama-anggota"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                data-testid="input-nama-anggota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panggilan-anggota">Nama panggilan</Label>
              <Input
                id="panggilan-anggota"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="cth. Rangga"
                data-testid="input-panggilan-anggota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="angkatan-anggota">Angkatan</Label>
              <Input
                id="angkatan-anggota"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                placeholder="cth. 13"
                data-testid="input-angkatan-anggota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahun-anggota">Tahun masuk</Label>
              <Input
                id="tahun-anggota"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="cth. 2023"
                data-testid="input-tahun-anggota"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="status-anggota">Jabatan / status keanggotaan</Label>
              <Input
                id="status-anggota"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="cth. Anggota, Ketua Faksi, Alumni"
                data-testid="input-status-anggota"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="keahlian-anggota">Keahlian (pisahkan dengan koma)</Label>
              <Input
                id="keahlian-anggota"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="cth. MikroTik, Linux, Fiber Optic"
                data-testid="input-keahlian-anggota"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-anggota">Deskripsi singkat</Label>
            <Textarea
              id="deskripsi-anggota"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="input-deskripsi-anggota"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto profil</Label>
            <PhotoUploader value={photo ? [photo] : []} onChange={(urls) => setPhoto(urls[0] ?? "")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="btn-cancel-anggota">
            Batal
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !fullName.trim()}
            data-testid="btn-save-anggota"
          >
            {save.isPending && <Loader2 className="animate-spin" />} Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
