import { Link, Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, ExternalLink, FolderKanban, Loader2, LogOut, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KegiatanAdmin from "@/components/admin/KegiatanAdmin";
import StrukturAdmin from "@/components/admin/StrukturAdmin";
import AnggotaAdmin from "@/components/admin/AnggotaAdmin";
import ProjekAdmin from "@/components/admin/ProjekAdmin";
import { SettingsManager, TujuanManager } from "@/components/admin/ContentManagers";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";
import { useStats } from "@/lib/hooks";
import { endSession, useMe } from "@/lib/session";

const TABS = [
  { value: "kegiatan", label: "Kegiatan" },
  { value: "struktur", label: "Struktur" },
  { value: "anggota", label: "Anggota" },
  { value: "projek", label: "Projek" },
  { value: "tujuan", label: "Tujuan & Visi" },
  { value: "pengaturan", label: "Pengaturan" },
] as const;

export default function Admin() {
  const { data: me, isLoading } = useMe();
  const { data: stats } = useStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid min-h-[50svh] place-items-center">
        <Loader2 className="size-6 animate-spin text-cyan-300" />
      </div>
    );
  }
  if (!me) return <Navigate to="/login" replace />;

  async function handleLogout() {
    await endSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        kicker="Admin Command Center"
        title="Dashboard Admin"
        description="Kelola seluruh konten website Teknisi TKJ — kegiatan, struktur, anggota, projek, tujuan faksi, dan pengaturan situs."
        action={
          <div className="flex gap-2">
            <Link to="/" className={buttonVariants({ variant: "outline", size: "sm" })} data-testid="btn-view-site">
              <ExternalLink /> Lihat Situs
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="btn-logout">
              <LogOut /> Keluar
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} value={stats?.members ?? 0} label="Anggota" testid="admin-stat-anggota" />
        <StatCard icon={CalendarDays} value={stats?.activities ?? 0} label="Kegiatan" testid="admin-stat-kegiatan" />
        <StatCard icon={FolderKanban} value={stats?.projects ?? 0} label="Projek" testid="admin-stat-projek" />
      </div>
      <Tabs defaultValue="kegiatan" className="mt-10">
        <TabsList
          variant="line"
          className="no-scrollbar w-full max-w-full justify-start overflow-x-auto"
        >
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} data-testid={`admin-tab-${t.value}`}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="kegiatan" className="mt-6">
          <KegiatanAdmin />
        </TabsContent>
        <TabsContent value="struktur" className="mt-6">
          <StrukturAdmin />
        </TabsContent>
        <TabsContent value="anggota" className="mt-6">
          <AnggotaAdmin />
        </TabsContent>
        <TabsContent value="projek" className="mt-6">
          <ProjekAdmin />
        </TabsContent>
        <TabsContent value="tujuan" className="mt-6">
          <TujuanManager />
        </TabsContent>
        <TabsContent value="pengaturan" className="mt-6">
         <div className="space-y-10">
          <PasswordChangeForm />
          <SettingsManager />
         </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
