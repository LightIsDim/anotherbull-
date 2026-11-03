import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Network,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/layout/Navbar";
import StatCard from "@/components/common/StatCard";
import ActivityCard from "@/components/cards/ActivityCard";
import ProjectCard from "@/components/cards/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/constants";
import { useStats } from "@/lib/hooks";
import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Activity, Project } from "@/types";

const TILES: { to: string; testid: string; label: string; desc: string; icon: LucideIcon; span?: string }[] = [
  { to: "/kegiatan", testid: "kegiatan", label: "Dokumentasi Kegiatan", desc: "Galeri foto dan laporan setiap kegiatan faksi", icon: CalendarDays, span: "sm:col-span-2" },
  { to: "/struktur", testid: "struktur", label: "Struktur Kepemimpinan", desc: "Bagan organisasi dan pembagian tugas", icon: Network },
  { to: "/anggota", testid: "anggota", label: "Anggota", desc: "Database anggota per angkatan", icon: Users },
  { to: "/projek", testid: "projek", label: "Projek", desc: "Karya jaringan, server, dan pemrograman", icon: FolderKanban },
  { to: "/tujuan", testid: "tujuan", label: "Tujuan Faksi", desc: "Visi, misi, dan arah perjuangan", icon: Target },
];

export default function Home() {
  const { data: stats } = useStats();
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: () => apiGet<Activity[]>("/activities"),
  });
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("/projects"),
  });
  const navigate = useNavigate();

  const latestActivities = (activities ?? []).slice(0, 3);
  const latestProjects = (projects ?? []).slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src={HERO_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background"
          aria-hidden="true"
        />
        <div className="tkj-grid-bg absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3">
              <BrandMark className="size-12" />
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">
                Faksi Teknik Komputer &amp; Jaringan
              </p>
            </div>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Dokumentasi, Karya, dan Perjalanan{" "}
              <span className="text-red-500">Teknisi TKJ</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pusat informasi dan dokumentasi komunitas TEKNISI TKJ — dari praktik
              instalasi jaringan, konfigurasi server, hingga karya pemrograman. Kami
              belajar, berkarya, dan mencatat setiap perjalanan menjadi teknisi yang
              profesional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/kegiatan"
                className={buttonVariants({ size: "lg" })}
                data-testid="hero-cta-kegiatan"
              >
                <CalendarDays /> Dokumentasi Kegiatan
              </Link>
              <Link
                to="/projek"
                className={buttonVariants({ variant: "outline", size: "lg" })}
                data-testid="hero-cta-projek"
              >
                <FolderKanban /> Lihat Projek
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            <StatCard icon={Users} value={stats?.members ?? 0} label="Anggota" testid="stat-anggota" />
            <StatCard icon={CalendarDays} value={stats?.activities ?? 0} label="Kegiatan" testid="stat-kegiatan" />
            <StatCard icon={FolderKanban} value={stats?.projects ?? 0} label="Projek" testid="stat-projek" />
          </motion.div>
        </div>
      </section>

      {/* QUICK NAV */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader title="Jelajahi" to="/kegiatan" hideLink />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map(({ to, testid, label, desc, icon: Icon, span }) => (
            <Link
              key={to}
              to={to}
              data-testid={`quick-nav-${testid}`}
              className={`group rounded-xl border border-border/70 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 ${span ?? ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-lg bg-red-600/15 ring-1 ring-red-500/40">
                  <Icon className="size-5 text-red-400" />
                </div>
                <ArrowRight className="size-5 -translate-x-1 text-cyan-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* KEGIATAN TERBARU */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader title="Kegiatan Terbaru" to="/kegiatan" />
        {latestActivities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestActivities.map((a) => (
              <ActivityCard key={a.id} activity={a} onOpen={() => navigate("/kegiatan")} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Dokumentasi kegiatan akan tampil di sini.
          </p>
        )}
      </section>

      {/* PROJEK UNGGULAN */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader title="Projek Unggulan" to="/projek" />
        {latestProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={() => navigate("/projek")} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Karya dan projek unggulan akan tampil di sini.
          </p>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, to, hideLink }: { title: string; to: string; hideLink?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
        <div className="tkj-stripe mt-2 h-0.5 w-14 rounded-full" />
      </div>
      {!hideLink && (
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          data-testid={`home-link-${to.slice(1)}`}
        >
          Lihat semua <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
