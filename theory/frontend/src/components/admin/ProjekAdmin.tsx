import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderX, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectFormDialog from "@/components/admin/ProjectFormDialog";
import type { Project } from "@/types";

export default function ProjekAdmin() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("/projects"),
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/projects/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Projek dihapus");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus"),
  });

  const list = projects ?? [];
  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} data-testid="btn-add-projek">
          <Plus /> Tambah Projek
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
            icon={FolderX}
            title="Belum ada projek"
            description="Tampilkan karya pertama faksi di sini."
            testid="empty-projek-admin"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              admin
              onOpen={setEditing}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}
      <ProjectFormDialog
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
        title="Hapus projek ini?"
        description={deleting ? `"${deleting.title}" akan dihapus permanen.` : ""}
        onConfirm={async () => {
          if (deleting) await del.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
