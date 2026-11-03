import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Network, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import LeaderNode from "@/components/struktur/LeaderNode";
import LeaderFormDialog from "@/components/admin/LeaderFormDialog";
import type { Leader } from "@/types";

export default function StrukturAdmin() {
  const qc = useQueryClient();
  const { data: leaders, isLoading } = useQuery({
    queryKey: ["leaders"],
    queryFn: () => apiGet<Leader[]>("/leaders"),
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [deleting, setDeleting] = useState<Leader | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/leaders/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaders"] });
      toast.success("Pengurus dihapus");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus"),
  });

  const list = leaders ?? [];
  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} data-testid="btn-add-pengurus">
          <Plus /> Tambah Pengurus
        </Button>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Network}
            title="Bagan masih kosong"
            description="Tambahkan Ketua terlebih dahulu (urutan 0 berada di puncak bagan)."
            testid="empty-pengurus-admin"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <LeaderNode
              key={l.id}
              leader={l}
              admin
              onOpen={undefined}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}
      <LeaderFormDialog
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
        title="Hapus pengurus ini?"
        description={deleting ? `"${deleting.name} — ${deleting.position}" akan dihapus permanen.` : ""}
        onConfirm={async () => {
          if (deleting) await del.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
