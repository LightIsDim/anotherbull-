import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FolderX, Plus, Users, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ImageLightbox, { type LightboxState } from "@/components/common/ImageLightbox";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectFormDialog from "@/components/admin/ProjectFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMe } from "@/lib/session";
import { formatDate, slugify } from "@/lib/format";
import { PROJEK_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/types";

export default function Projek() {
  const { data: me } = useMe();
  const isAdmin = !!me;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("/projects"),
  });
  const [category, setCategory] = useState("semua");
  const [detail, setDetail] = useState<Project | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const qc = useQueryClient();

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

  const list = data ?? [];
  const filtered = list.filter((p) => category === "semua" || p.category === category);

  return (
    <div>
      <PageHeader
        kicker="Dokumentasi Projek"
        title="Hasil Karya & Projek"
        description="Karya nyata Teknisi TKJ — instalasi jaringan, konfigurasi MikroTik, server, pemrograman, dan lainnya. Lengkap dengan dokumen pendukung."
        action={
          isAdmin ? (
            <Button onClick={() => setCreating(true)} data-testid="btn-add-projek">
              <Plus /> Tambah Projek
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <Chip
            active={category === "semua"}
            onClick={() => setCategory("semua")}
            testid="filter-kategori-projek-semua"
          >
            Semua
          </Chip>
          {PROJEK_CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              testid={`filter-kategori-projek-${slugify(c)}`}
            >
              {c}
            </Chip>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-6">
            <EmptyState
              icon={WifiOff}
              title="Tidak dapat memuat projek"
              description="Koneksi ke server terputus. Coba muat ulang halaman."
              testid="error-projek"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={FolderX}
              title={category === "semua" ? "Belum ada projek" : "Belum ada projek di kategori ini"}
              description="Karya dan projek akan tampil di sini."
              testid="empty-projek"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                admin={isAdmin}
                onOpen={setDetail}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectDetailDialog
        project={detail}
        onClose={() => setDetail(null)}
        onPhoto={(url) => setLightbox({ url, caption: detail?.title })}
      />
      <ImageLightbox state={lightbox} onClose={() => setLightbox(null)} />
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

function ProjectDetailDialog({
  project,
  onClose,
  onPhoto,
}: {
  project: Project | null;
  onClose: () => void;
  onPhoto: (url: string) => void;
}) {
  return (
    <Dialog open={project !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85svh] overflow-y-auto p-4 sm:max-w-2xl">
        {project && (
          <div className="space-y-4">
            <DialogHeader>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">
                {project.category} · {formatDate(project.date)}
              </p>
              <DialogTitle className="text-xl">{project.title}</DialogTitle>
            </DialogHeader>
            {project.team && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4 shrink-0" /> {project.team}
              </p>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.description || "Tidak ada deskripsi."}
            </p>
            {project.tech.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <Badge key={t} variant="outline" className="border-cyan-400/30 font-mono text-cyan-300">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
            {project.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {project.photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onPhoto(url)}
                    data-testid={`projek-photo-${i}`}
                    className="overflow-hidden rounded-lg ring-1 ring-border transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <img
                      src={url}
                      alt={`${project.title} — foto ${i + 1}`}
                      loading="lazy"
                      className="aspect-video size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {project.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  File pendukung
                </p>
                {project.attachments.map((f, i) => (
                  <a
                    key={`${f.url}-${i}`}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`projek-attachment-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/50 px-3 py-2.5 text-sm transition-colors hover:border-cyan-400/40"
                  >
                    <span className="truncate">{f.name}</span>
                    <Download className="size-4 shrink-0 text-cyan-300" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
