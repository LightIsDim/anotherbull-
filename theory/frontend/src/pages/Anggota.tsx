import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MemberCard from "@/components/cards/MemberCard";
import MemberFormDialog from "@/components/admin/MemberFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMe } from "@/lib/session";
import { slugify } from "@/lib/format";
import type { Member } from "@/types";

export default function Anggota() {
  const { data: me } = useMe();
  const isAdmin = !!me;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["members"],
    queryFn: () => apiGet<Member[]>("/members"),
  });
  const [search, setSearch] = useState("");
  const [angkatanFilter, setAngkatanFilter] = useState("semua");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const qc = useQueryClient();

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

  const list = data ?? [];
  const angkatans = useMemo(
    () =>
      Array.from(new Set(list.map((m) => m.angkatan).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    [list]
  );

  const q = search.trim().toLowerCase();
  const filtered = list.filter((m) => {
    const matchQ =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.nickname.toLowerCase().includes(q);
    const matchA = angkatanFilter === "semua" || m.angkatan === angkatanFilter;
    return matchQ && matchA;
  });

  const groups: [string, Member[]][] =
    angkatanFilter === "semua"
      ? angkatans
          .map((a) => [a, filtered.filter((m) => m.angkatan === a)] as [string, Member[]])
          .filter(([, ms]) => ms.length > 0)
      : [];

  return (
    <div>
      <PageHeader
        kicker="Database Anggota"
        title="Daftar Anggota"
        description="Profil para teknisi muda Teknisi TKJ — cari berdasarkan nama, filter dan kelompokkan berdasarkan angkatan."
        action={
          isAdmin ? (
            <Button onClick={() => setCreating(true)} data-testid="btn-add-anggota">
              <Plus /> Tambah Anggota
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search + filter */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau panggilan..."
              className="h-11 pl-9"
              data-testid="input-search-anggota"
            />
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            <Chip
              active={angkatanFilter === "semua"}
              onClick={() => setAngkatanFilter("semua")}
              testid="filter-angkatan-semua"
            >
              Semua Angkatan
            </Chip>
            {angkatans.map((a) => (
              <Chip
                key={a}
                active={angkatanFilter === a}
                onClick={() => setAngkatanFilter(a)}
                testid={`filter-angkatan-${slugify(a)}`}
              >
                Angkatan {a}
              </Chip>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-6">
            <EmptyState
              icon={WifiOff}
              title="Tidak dapat memuat anggota"
              description="Koneksi ke server terputus. Coba muat ulang halaman."
              testid="error-anggota"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title={q || angkatanFilter !== "semua" ? "Tidak ditemukan" : "Belum ada anggota"}
              description={
                q || angkatanFilter !== "semua"
                  ? "Coba ubah kata kunci atau filter angkatan."
                  : "Database anggota akan tampil di sini."
              }
              testid="empty-anggota"
            />
          </div>
        ) : groups.length > 0 ? (
          <div className="mt-8 space-y-12">
            {groups.map(([angkatan, members]) => (
              <section key={angkatan} data-testid={`group-angkatan-${slugify(angkatan)}`}>
                <h2 className="font-heading text-xl font-bold">
                  <span className="mr-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Angkatan
                  </span>
                  {angkatan}
                </h2>
                <div className="tkj-stripe mt-2 h-0.5 w-16 rounded-full" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {members.map((m) => (
                    <MemberCard
                      key={m.id}
                      member={m}
                      admin={isAdmin}
                      onEdit={setEditing}
                      onDelete={setDeleting}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                admin={isAdmin}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

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
