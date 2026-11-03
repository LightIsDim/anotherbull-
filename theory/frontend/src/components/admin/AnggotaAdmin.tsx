import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import MemberCard from "@/components/cards/MemberCard";
import MemberFormDialog from "@/components/admin/MemberFormDialog";
import type { Member } from "@/types";

export default function AnggotaAdmin() {
  const qc = useQueryClient();
  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () => apiGet<Member[]>("/members"),
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/members/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["members"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Anggota dihapus");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus"),
  });

  const list = members ?? [];
  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} data-testid="btn-add-anggota">
          <Plus /> Tambah Anggota
        </Button>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Users}
            title="Belum ada anggota"
            description="Tambahkan anggota pertama ke database faksi."
            testid="empty-anggota-admin"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => (
            <MemberCard key={m.id} member={m} admin onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}
      <MemberFormDialog
        open={creating || editing !== null}
        initial={editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus anggota ini?"
        description={deleting ? `"${deleting.full_name}" akan dihapus permanen.` : ""}
        onConfirm={async () => {
          if (deleting) await del.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
