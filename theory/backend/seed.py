"""Seed data for the TKJ faction site — idempotent, run manually:
    cd /app/backend && python seed.py
Skips any collection that already has documents; never drops collections.
"""

import asyncio
import uuid
from pathlib import Path

from lib.auth import hash_password
from lib.db import db, ensure_indexes
from routers.uploads import UPLOAD_DIR

IMG = "https://images.unsplash.com/{pid}?auto=format&fit=crop&w=1200&q=80"
P_HERO = "photo-1785682231847-93265d8e633d"
P_RACK = "photo-1762163516269-3c143e04175c"
P_TECH = "photo-1783419538460-676cb89a0d19"
P_LAB = "photo-1719159381981-1327b22aff9b"
P_COLL = "photo-1723987135977-ae935608939e"
P_ETH = "photo-1594915440248-1e419eba6611"
P_RED = "photo-1591808216268-ce0b82787efe"
P_FACE1 = "photo-1542909168-82c3e7fdca5c"
P_FACE2 = "photo-1619431667975-e93b820cde63"
P_FACE3 = "photo-1548810020-ea2f1da35cff"
P_FACE4 = "photo-1647593782884-1a6779139eb5"


def demo_pdf(title: str) -> str:
    """A minimal one-page PDF so seeded attachments actually download."""
    name = f"{uuid.uuid4().hex}.pdf"
    content = (
        "%PDF-1.4\n"
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]"
        f"/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        "4 0 obj<</Length 60>>stream\n"
        "BT /F1 18 Tf 72 720 Td (" + title + ") Tj ET\n"
        "endstream endobj\n"
        "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        "trailer<</Root 1 0 R>>\n%%EOF"
    )
    Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    (Path(UPLOAD_DIR) / name).write_text(content, encoding="latin-1")
    return f"/api/files/{name}"


async def seed_users() -> None:
    if await db.users.count_documents({}) > 0:
        return
    await db.users.insert_one(
        {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "password_hash": hash_password("tkjadmin2026"),
        }
    )
    print("users: seeded admin")


ACTIVITIES = [
    {
        "title": "Workshop Instalasi Jaringan LAN & Crimping",
        "category": "Workshop",
        "date": "2026-01-18",
        "description": (
            "Workshop perakitan kabel LAN standar T568B dan instalasi jaringan "
            "di Lab Komputer 2. Peserta berlatih mengukur kabel, memasang konektor "
            "RJ-45, lalu menguji hasil crimping dengan LAN tester sampai semua titik "
            "lagi-lagi berfungsi normal."
        ),
        "photos": [IMG.format(pid=P_LAB), IMG.format(pid=P_ETH)],
    },
    {
        "title": "Sertifikasi MTCNA — MikroTik Network Associate",
        "category": "Sertifikasi",
        "date": "2026-02-10",
        "description": (
            "Kelas persiapan ujian MTCNA: pengenalan RouterOS, konfigurasi dasar "
            "IP address, DHCP server, dan firewall nat. Target: seluruh anggota "
            "angkatan 14 lulus sertifikasi sebelum semester berakhir."
        ),
        "photos": [IMG.format(pid=P_RED)],
    },
    {
        "title": "Praktik Fiber Optic Splicing di Lab TKJ",
        "category": "Praktek Lab",
        "date": "2026-03-05",
        "description": (
            "Praktik penyambungan fiber optic dengan fusion splicer: stripping, "
            "cleaving, splicing, dan pengukuran redaman dengan optical power meter. "
            "Setiap kelompok wajib mencatat hasil pengukuran di laporan praktikum."
        ),
        "photos": [IMG.format(pid=P_ETH), IMG.format(pid=P_HERO)],
    },
    {
        "title": "Pemetaan & Persiapan LKS ITNSA",
        "category": "Lomba / LKS",
        "date": "2026-04-02",
        "description": (
            "Pemetaan bakat dan seleksi internal untuk Lomba Kompetensi Siswa "
            "bidang IT Network Systems Administration. Materi latihan: konfigurasi "
            "router, server Debian, dan troubleshooting jaringan under pressure."
        ),
        "photos": [IMG.format(pid=P_TECH)],
    },
    {
        "title": "Rapat Evaluasi Program Kerja Faksi",
        "category": "Rapat Organisasi",
        "date": "2026-05-09",
        "description": (
            "Evaluasi program kerja semester ini bersama seluruh pengurus dan "
            "perwakilan angkatan. Hasil: tiga proyek lanjutan disetujui, dua "
            "kegiatan dijadwalkan ulang, dan divisi server resmi berdiri."
        ),
        "photos": [IMG.format(pid=P_COLL)],
    },
]

LEADERS = [
    {
        "name": "Rangga Aditya Pratama",
        "position": "Ketua",
        "period": "2025 / 2026",
        "duties": "Memimpin faksi, mengoordinasikan seluruh program kerja, mengawasi divisi, dan mewakili Teknisi TKJ di forum sekolah.",
        "photo": f"https://images.unsplash.com/{P_FACE1}?auto=format&fit=crop&w=400&q=80",
        "order": 0,
    },
    {
        "name": "Diaz Nur Hakim",
        "position": "Wakil Ketua",
        "period": "2025 / 2026",
        "duties": "Mendampingi ketua, mengambil alih tanggung jawab saat ketua berhalangan, serta mengawasi jalannya proyek teknis divisi.",
        "photo": f"https://images.unsplash.com/{P_FACE4}?auto=format&fit=crop&w=400&q=80",
        "order": 1,
    },
    {
        "name": "Salsabila Rahma",
        "position": "Sekretaris",
        "period": "2025 / 2026",
        "duties": "Mengelola administrasi faksi, notulen rapat, absensi anggota, dan dokumentasi tertulis seluruh kegiatan.",
        "photo": f"https://images.unsplash.com/{P_FACE2}?auto=format&fit=crop&w=400&q=80",
        "order": 2,
    },
    {
        "name": "Bryan Saputra",
        "position": "Bendahara",
        "period": "2025 / 2026",
        "duties": "Mengelola kas faksi, mencatat pemasukan dan pengeluaran, serta menyusun laporan keuangan setiap akhir bulan.",
        "photo": f"https://images.unsplash.com/{P_FACE3}?auto=format&fit=crop&w=400&q=80",
        "order": 3,
    },
    {
        "name": "Fajar Ramadhan",
        "position": "Kepala Divisi Jaringan",
        "period": "2025 / 2026",
        "duties": "Memimpin instalasi LAN dan fiber optic, merancang topologi jaringan, dan menjaga inventaris perangkat jaringan.",
        "photo": "",
        "order": 4,
    },
    {
        "name": "Nadia Putri",
        "position": "Kepala Divisi Server",
        "period": "2025 / 2026",
        "duties": "Mengelola server Debian dan virtualisasi Proxmox milik lab, serta deploy layanan hosting internal faksi.",
        "photo": "",
        "order": 5,
    },
    {
        "name": "Yoga Prasetyo",
        "position": "Kepala Divisi Hardware",
        "period": "2025 / 2026",
        "duties": "Mengurus perakitan dan perawatan PC, service perangkat, serta pelatihan troubleshooting hardware untuk anggota baru.",
        "photo": "",
        "order": 6,
    },
]

MEMBERS = [
    {"full_name": "Rangga Aditya Pratama", "nickname": "Rangga", "angkatan": "13", "year": 2023, "status": "Ketua Faksi", "skills": ["MikroTik", "Linux", "Jaringan Dasar"], "description": "Ketua faksi yang fokus pada infrastruktur jaringan dan manajemen tim.", "photo": ""},
    {"full_name": "Salsabila Rahma", "nickname": "Salsa", "angkatan": "13", "year": 2023, "status": "Sekretaris", "skills": ["Administrasi", "Dokumentasi", "Desain Grafis"], "description": "Jaga fondasi administrasi faksi dan desainer poster kegiatan.", "photo": ""},
    {"full_name": "Bryan Saputra", "nickname": "Bryan", "angkatan": "13", "year": 2023, "status": "Bendahara", "skills": ["Manajemen Keuangan", "Kewirausahaan"], "description": "Pengelola kas faksi dan penggerak usaha jasa service komputer.", "photo": ""},
    {"full_name": "Aldi Firmansyah", "nickname": "Aldi", "angkatan": "13", "year": 2023, "status": "Alumni", "skills": ["Fiber Optic", "Teknisi ISP"], "description": "Alumni yang kini bekerja sebagai teknisi ISP, mentor fiber optic.", "photo": ""},
    {"full_name": "Diaz Nur Hakim", "nickname": "Diaz", "angkatan": "14", "year": 2024, "status": "Wakil Ketua", "skills": ["Cisco", "Troubleshooting", "Debian Server"], "description": "Spesialis routing dan switching, asisten pelatih MTCNA.", "photo": ""},
    {"full_name": "Fajar Ramadhan", "nickname": "Fajar", "angkatan": "14", "year": 2024, "status": "Anggota", "skills": ["Instalasi LAN", "Fiber Optic", "Crimping"], "description": "Tangan kanan divisi jaringan untuk semua urusan lapangan.", "photo": ""},
    {"full_name": "Nadia Putri", "nickname": "Nadia", "angkatan": "14", "year": 2024, "status": "Anggota", "skills": ["Linux", "Web Server", "Proxmox"], "description": "Pengelola virtualisasi lab dan web server internal faksi.", "photo": ""},
    {"full_name": "Yoga Prasetyo", "nickname": "Yoga", "angkatan": "15", "year": 2025, "status": "Anggota", "skills": ["Perakitan PC", "Hardware", "Soldering"], "description": "Ahli perakitan dan service komputer, kepala divisi hardware.", "photo": ""},
    {"full_name": "Kirana Ayu", "nickname": "Kiran", "angkatan": "15", "year": 2025, "status": "Anggota", "skills": ["UI Desain", "Pemrograman Web"], "description": "Front-end developer dan desainer antarmuka proyek faksi.", "photo": ""},
    {"full_name": "Bagas Wicaksono", "nickname": "Bagas", "angkatan": "15", "year": 2025, "status": "Anggota", "skills": ["Keamanan Jaringan", "Pentesting Dasar"], "description": "Muda yang antusias di CTF dan keamanan jaringan.", "photo": ""},
]

PROJECTS = [
    {
        "title": "Instalasi Jaringan LAN Lab Komputer 2",
        "category": "Instalasi Jaringan",
        "date": "2026-01-25",
        "team": "Divisi Jaringan — Fajar, Diaz, Yoga",
        "tech": ["Kabel Cat6 UTP", "Switch Managed", "LAN Tester", "Panel Patch"],
        "description": (
            "Peremajaan jalur jaringan Lab Komputer 2: penarikan 36 titik LAN, "
            "pemasangan panel patch, labeling kabel, dan pengujian link hingga 1 Gbps "
            "stabil. Proyek pertama yang dikerjakan lintas angkatan."
        ),
        "photos": [IMG.format(pid=P_ETH), IMG.format(pid=P_LAB)],
    },
    {
        "title": "Konfigurasi RouterOS: VLAN & Hotspot Voucher",
        "category": "Konfigurasi Mikrotik",
        "date": "2026-02-20",
        "team": "Diaz Nur Hakim, Rangga Aditya Pratama",
        "tech": ["MikroTik hAP", "RouterOS 7", "Winbox", "User Manager"],
        "description": (
            "Segmentasi jaringan lab dengan VLAN 10 (siswa), VLAN 20 (server), dan "
            "VLAN 99 (manajemen), plus layanan hotspot berbasis voucher untuk "
            "ujian online. Dokumentasi lengkap tersedia di lampiran."
        ),
        "photos": [IMG.format(pid=P_RED)],
    },
    {
        "title": "Deploy Web Server Debian 12 + Nginx di Proxmox",
        "category": "Server dan Hosting",
        "date": "2026-03-15",
        "team": "Nadia Putri — Divisi Server",
        "tech": ["Debian 12", "Nginx", "Proxmox VE", "Let's Encrypt"],
        "description": (
            "Membangun VM Debian di Proxmox, hardening SSH, instalasi Nginx, dan "
            "penerbitan sertifikat TLS. Kini mem_hosting situs dokumentasi internal "
            "faksi yang dapat diakses seluruh anggota."
        ),
        "photos": [IMG.format(pid=P_RACK)],
    },
    {
        "title": "Aplikasi Inventaris Barang Lab TKJ",
        "category": "Pemrograman",
        "date": "2026-04-10",
        "team": "Kirana Ayu, Bagas Wicaksono",
        "tech": ["HTML", "CSS", "JavaScript", "LocalStorage"],
        "description": (
            "Aplikasi web sederhana untuk mencatat inventaris perangkat lab: kode "
            "barang, kondisi, dan histori peminjaman. Dibangun saat praktik "
            "pemrograman web dan kini dipakai divisi hardware."
        ),
        "photos": [IMG.format(pid=P_COLL)],
    },
    {
        "title": "Rakit Ulang 10 PC untuk Lab RPL",
        "category": "Perakitan Komputer",
        "date": "2026-05-02",
        "team": "Yoga Prasetyo + Tim Hardware",
        "tech": ["Ryzen 5", "SSD 512 GB", "PSU 450W", "Thermal Paste"],
        "description": (
            "Perakitan dan upgrade 10 PC bekas: pembersihan komponen, penggantian "
            "termal, penambahan SSD, dan instalasi OS. Semua unit lulus uji "
            "stress-test 2 jam tanpa throttling."
        ),
        "photos": [IMG.format(pid=P_TECH)],
    },
]


async def seed_activities() -> None:
    if await db.activities.count_documents({}) > 0:
        return
    for data in ACTIVITIES:
        await db.activities.insert_one({**data, "id": str(uuid.uuid4())})
    print(f"activities: seeded {len(ACTIVITIES)}")


async def seed_leaders() -> None:
    if await db.leaders.count_documents({}) > 0:
        return
    for data in LEADERS:
        await db.leaders.insert_one({**data, "id": str(uuid.uuid4())})
    print(f"leaders: seeded {len(LEADERS)}")


async def seed_members() -> None:
    if await db.members.count_documents({}) > 0:
        return
    for data in MEMBERS:
        await db.members.insert_one({**data, "id": str(uuid.uuid4())})
    print(f"members: seeded {len(MEMBERS)}")


async def seed_projects() -> None:
    if await db.projects.count_documents({}) > 0:
        return
    for data in PROJECTS:
        doc = {**data, "id": str(uuid.uuid4())}
        if doc["category"] in ("Konfigurasi Mikrotik", "Instalasi Jaringan"):
            doc["attachments"] = [
                {
                    "name": "laporan-proyek.pdf",
                    "url": demo_pdf(doc["title"][:40].replace(" ", "-")),
                }
            ]
        await db.projects.insert_one(doc)
    print(f"projects: seeded {len(PROJECTS)}")


FAKSI_DEFAULT = {
    "latar_belakang": "",
    "visi": "",
    "misi": "",
    "tujuan_utama": "",
    "prinsip": "",
    "harapan": "",
}

SETTINGS_DEFAULT = {
    "logo_url": "",
    "description": (
        "Teknisi TKJ adalah kumpulan Teknik Komputer dan Jaringan yang berkumpul "
        "untuk belajar, berkarya, dan mendokumentasikan perjalanan menjadi "
        "teknisi jaringan yang profesional."
    ),
    "instagram": "https://instagram.com/",
    "youtube": "",
    "whatsapp": "",
    "email": "",
}


async def seed_content() -> None:
    # Tujuan faksi dibiarkan kosong sesuai permintaan: admin yang mengisi lewat dashboard.
    if await db.site_content.count_documents({"key": "faksi"}) == 0:
        await db.site_content.insert_one({"key": "faksi", "data": FAKSI_DEFAULT})
        print("content: seeded faksi (kosong, diisi admin)")
    if await db.site_content.count_documents({"key": "settings"}) == 0:
        await db.site_content.insert_one({"key": "settings", "data": SETTINGS_DEFAULT})
        print("content: seeded settings")


async def main() -> None:
    await seed_users()
    await seed_activities()
    await seed_leaders()
    await seed_members()
    await seed_projects()
    await seed_content()
    await ensure_indexes()
    print("seed selesai.")


if __name__ == "__main__":
    asyncio.run(main())
