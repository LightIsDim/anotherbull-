// Shared constants for the TEKNISI TKJ site.

export const NAV_LINKS = [
  { to: "/", label: "Beranda", testid: "beranda" },
  { to: "/kegiatan", label: "Dokumentasi Kegiatan", testid: "kegiatan" },
  { to: "/struktur", label: "Struktur Kepemimpinan", testid: "struktur" },
  { to: "/anggota", label: "Anggota", testid: "anggota" },
  { to: "/projek", label: "Projek", testid: "projek" },
  { to: "/tujuan", label: "Tujuan Faksi", testid: "tujuan" },
] as const;

// Kategori projek — sesuai spesiasi faksi TKJ.
export const PROJEK_CATEGORIES = [
  "Instalasi Jaringan",
  "Konfigurasi Mikrotik",
  "Perakitan Komputer",
  "Server dan Hosting",
  "Pemrograman",
  "Keamanan Jaringan",
  "Troubleshooting",
] as const;

// Saran kategori kegiatan (bebas diisi lewat datalist).
export const KEGIATAN_CATEGORIES = [
  "Workshop",
  "Sertifikasi",
  "Praktek Lab",
  "Lomba / LKS",
  "Rapat Organisasi",
  "Sosialisasi",
  "Lainnya",
] as const;

// Enam bagian halaman "Tujuan dan Arah Perjuangan Teknisi TKJ" — isinya murni milik admin.
export const FAKSI_SECTIONS = [
  { key: "latar_belakang", label: "Latar Belakang Pembentukan Faksi" },
  { key: "visi", label: "Visi" },
  { key: "misi", label: "Misi" },
  { key: "tujuan_utama", label: "Tujuan Utama" },
  { key: "prinsip", label: "Prinsip dan Nilai Perjuangan" },
  { key: "harapan", label: "Harapan untuk Generasi Teknisi TKJ Berikutnya" },
] as const;

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1785682231847-93265d8e633d?auto=format&fit=crop&w=1920&q=80";
