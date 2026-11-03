import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarX2, Plus, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ImageLightbox, { type LightboxState } from "@/components/common/ImageLightbox";
import ActivityCard from "@/components/cards/ActivityCard";
import ActivityFormDialog from "@/components/admin/ActivityFormDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMe } from "@/lib/session";
import { formatDate, slugify } from "@/lib/format";
import type { Activity } from "@/types";

export default function Kegiatan() {
  const { data: me } = useMe();
  const isAdmin = !!me;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["activities"],
    queryFn: () => apiGet<Activity[]>("/activities"),
  });
  const [category, setCategory] = useState("semua");
  const [detail, setDetail] = useState<Activity | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const qc = useQueryClient();

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

  const list = data ?? [];
  const categories = useMemo(
    () => Array.from(new Set(list.map((a) => a.category).filter(Boolean))).sort(),
    [list]
  );
  const filtered = list.filter((a) => category === "semua" || a.category === category);

  return (
    <div>
      <PageHeader
        kicker="Dokumentasi Kegiatan"
        title="Galeri Kegiatan"
        description="Rekam jejak seluruh kegiatan Teknisi TKJ — workshop, praktik lab, sertifikasi, hingga kompetisi. Klik kartu untuk melihat detail dan foto ukuran penuh."
        action={
          isAdmin ? (
            <Button onClick={() => setCreating(true)} data-testid="btn-add-kegiatan">
              <Plus /> Tambah Kegiatan
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <Chip
            active={category === "semua"}
            onClick={() => setCategory("semua")}
            testid="filter-kategori-semua"
          >
            Semua
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              testid={`filter-kategori-${slugify(c)}`}
            >
              {c}
            </Chip>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-6">
            <EmptyState
              icon={WifiOff}
              title="Tidak dapat memuat kegiatan"
              description="Koneksi ke server terputus. Coba muat ulang halaman."
              testid="error-kegiatan"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={CalendarX2}
              title="Belum ada kegiatan"
              description={
                category === "semua"
                  ? "Dokumentasi kegiatan akan tampil di sini."
                  : "Tidak ada kegiatan pada kategori ini."
              }
              testid="empty-kegiatan"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                admin={isAdmin}
                onOpen={setDetail}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <ActivityDetailDialog
        activity={detail}
        onClose={() => setDetail(null)}
        onPhoto={(url) => setLightbox({ url, caption: detail?.title })}
      />
      <ImageLightbox state={lightbox} onClose={() => setLightbox(null)} />
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

function Chip({
  active,
  onClick,
  children,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-200",
        active
          ? "border-red-500 bg-red-600/15 text-red-300"
          : "border-border text-muted-foreground hover:border-cyan-400/50 hover:text-cyan-300"
      )}
    >
      {children}
    </button>
  );
}

function ActivityDetailDialog({
  activity,
  onClose,
  onPhoto,
}: {
  activity: Activity | null;
  onClose: () => void;
  onPhoto: (url: string) => void;
}) {
  return (
    <Dialog open={activity !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85svh] overflow-y-auto p-4 sm:max-w-2xl">
        {activity && (
          <div className="space-y-4">
            <DialogHeader>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">
                {activity.category} · {formatDate(activity.date)}
              </p>
              <DialogTitle className="text-xl">{activity.title}</DialogTitle>
            </DialogHeader>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {activity.description || "Tidak ada keterangan."}
            </p>
            {activity.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activity.photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onPhoto(url)}
                    data-testid={`kegiatan-photo-${i}`}
                    className="overflow-hidden rounded-lg ring-1 ring-border transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <img
                      src={url}
                      alt={`${activity.title} — foto ${i + 1}`}
                      loading="lazy"
                      className="aspect-video size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
