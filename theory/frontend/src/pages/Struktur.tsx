import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Network, Plus, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LeaderNode from "@/components/struktur/LeaderNode";
import LeaderFormDialog from "@/components/admin/LeaderFormDialog";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/session";
import type { Leader } from "@/types";

export default function Struktur() {
  const { data: me } = useMe();
  const isAdmin = !!me;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaders"],
    queryFn: () => apiGet<Leader[]>("/leaders"),
  });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [deleting, setDeleting] = useState<Leader | null>(null);
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/leaders/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaders"] });
      toast.success("Pengurus dihapus");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menghapus"),
  });

  const list = data ?? [];
  const head = list[0];
  const rest = list.slice(1);

  return (
    <div>
      <PageHeader
        kicker="Struktur Kepemimpinan"
        title="Bagan Organisasi"
        description="Susunan pengurus Teknisi TKJ beserta tugas dan periode kepemimpinannya. Seluruh jabatan dapat diperbarui admin kapan saja."
        action={
          isAdmin ? (
            <Button onClick={() => setCreating(true)} data-testid="btn-add-pengurus">
              <Plus /> Tambah Pengurus
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={WifiOff}
            title="Tidak dapat memuat struktur"
            description="Koneksi ke server terputus. Coba muat ulang halaman."
            testid="error-struktur"
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Network}
            title="Bagan masih kosong"
            description={
              isAdmin
                ? "Tambahkan Ketua terlebih dahulu (urutan 0 berada di puncak bagan)."
                : "Struktur organisasi akan tampil di sini."
            }
            action={
              isAdmin ? (
                <Button onClick={() => setCreating(true)} data-testid="btn-add-pengurus-empty">
                  <Plus /> Tambah Pengurus
                </Button>
              ) : undefined
            }
            testid="empty-struktur"
          />
        ) : (
          <>
            {head && <LeaderNode leader={head} head admin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />}
            {head && rest.length > 0 && (
              <div
                className="mx-auto h-8 w-px bg-gradient-to-b from-red-500/60 to-cyan-400/40"
                aria-hidden="true"
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((l) => (
                <LeaderNode
                  key={l.id}
                  leader={l}
                  admin={isAdmin}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          </>
        )}
      </div>

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
