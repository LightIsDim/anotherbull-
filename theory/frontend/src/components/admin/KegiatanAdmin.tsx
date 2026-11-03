import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarX2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ActivityCard from "@/components/cards/ActivityCard";
import ActivityFormDialog from "@/components/admin/ActivityFormDialog";
import type { Activity } from "@/types";

export default function KegiatanAdmin() {
  const qc = useQueryClient();
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => apiGet<Activity[]>("/activities"),
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/activities/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["activities"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Kegiatan dihapus");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus"),
  });

  const list = activities ?? [];
  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} data-testid="btn-add-kegiatan">
          <Plus /> Tambah Kegiatan
        </Button>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={CalendarX2}
            title="Belum ada kegiatan"
            description="Tambahkan dokumentasi kegiatan pertama."
            testid="empty-kegiatan-admin"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              admin
              onOpen={setEditing}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}
      <ActivityFormDialog
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
        title="Hapus kegiatan ini?"
        description={deleting ? `"${deleting.title}" akan dihapus permanen.` : ""}
        onConfirm={async () => {
          if (deleting) await del.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
