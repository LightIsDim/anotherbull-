# SPEC — TEKNISI TKJ (Dokumentasi Faksi TKJ)

Situs dokumentasi komunitas/faksi **TEKNISI TKJ** (Teknik Komputer dan Jaringan).
Bahasa UI: Indonesia. Tema: dark taktis — hitam `#090B0E`, merah `#DC2626` (garis dada polo),
putih, aksen cyan `#00E5FF`. Font: Outfit (heading), DM Sans (body), JetBrains Mono (aksen mono).

## Stack
- Backend: FastAPI + motor (MongoDB `app`), Pydantic v2 — semua route di `api_router` prefix `/api`.
- Frontend: Vite + React 19 + TS strict + Tailwind v4 + shadcn/base-ui, TanStack Query, path relatif `/api/*`.
- Upload file: `POST /api/uploads` (admin, multipart, maks 8 MB, whitelist ekstensi) → disimpan di
  `backend/uploads/`, dilayani publik via `GET /api/files/{name}` (regex nama `uuid32.ext`).

## Auth (RBAC minimal: publik baca, admin tulis)
- 1 akun admin di koleksi `users` (pbkdf2 hash). Kredensial: lihat `memory/test_credentials.md`.
- Login `POST /api/auth/login` → cookie httpOnly `tkj_session` (JWT HS256, secret `SESSION_SECRET` di `backend/.env`).
- `GET /api/auth/me` → **200 + `null`** saat belum login (tanpa 401, console pengunjung bersih);
  200 + AdminUser saat login. `POST /api/auth/logout`. Dependency `get_current_admin` (deny-by-default) menjaga SEMUA route tulis (POST/PUT/DELETE) + uploads; GET publik terbuka. Frontend: `useMe()` di `lib/session.ts`,
  logout WAJIB lewat `endSession()` (queryClient.clear()).
- Semua tulisan (anggota/pengurus/kegiatan/proyek) dikontrol server — UI hanya menyembunyikan kontrol.

## Data model (backend/models/tkj.py ↔ frontend/src/types.ts — ubah berpasangan)
- `activities`: id, title, description, date (YYYY-MM-DD), category, photos[], created_at, updated_at
- `leaders`: id, name, position, duties, period, photo, order (0 = puncak bagan), created_at
- `members`: id, full_name, nickname, angkatan, year, status, skills[], description, photo, created_at
- `projects`: id, title, description, date, category (7 kategori TKJ), team, tech[], photos[], attachments[{name,url}], created_at
- `site_content`: key unik (`faksi`, `settings`) + data: dict[str,str], updated_at
  - `faksi`: latar_belakang, visi, misi, tujuan_utama, prinsip, harapan — SENGAJA KOSONG (admin isi sendiri)
  - `settings`: logo_url, description, instagram, youtube, whatsapp, email
- `users`: id, username, password_hash

## Endpoints (semua di bawah /api)
- auth: POST /auth/login, POST /auth/logout, GET /auth/me, POST /auth/change-password (admin; verifikasi password lama, password baru min 8 karakter)
- CRUD: GET/POST /activities, GET/PUT/DELETE /activities/{id}; sama untuk /leaders, /members, /projects
- content: GET /content/{key} (publik, selalu 200; data kosong bila belum diedit), PUT /content/{key} (admin)
- GET /stats (counts anggota/kegiatan/proyek), POST /uploads (admin), GET /files/{name}

## Halaman (frontend/src/pages)
- `/` Beranda: hero + statistik live + tile navigasi + kegiatan/projek terbaru
- `/kegiatan`: galeri kartu, filter kategori, dialog detail, lightbox foto
- `/struktur`: bagan organisasi (leader order 0 = kepala, garis penghubung, grid di bawah)
- `/anggota`: pencarian nama/panggilan, filter & pengelompokan per angkatan
- `/projek`: filter 7 kategori, dialog detail + lampiran (download), lightbox
- `/tujuan`: "Tujuan dan Arah Perjuangan Teknisi TKJ" — 6 bagian konten milik admin
- `/login`: login admin; `/admin`: dashboard tab (Kegiatan/Struktur/Anggota/Projek/Tujuan & Visi/Pengaturan)
- Admin yang login juga melihat tombol Edit/Hapus inline di halaman publik.

## Seed (backend/seed.py — idempotent, skip koleksi berisi; TIDAK PERNAH drop koleksi)
- admin, 5 kegiatan, 7 pengurus, 10 anggota (angkatan 13/14/15 + 1 alumni), 5 projek
  (2 dengan lampiran PDF demo), site_content faksi (kosong) + settings (placeholder sosial).
- Jalankan: `cd /app/backend && python seed.py`. Data contoh semuanya bisa diedit/dihapus dari dashboard.

## Catatan
- Tanggal "hari ini" server: `backend/lib/dates.py`. Semua datetime disimpan aware-UTC.
- Sesi invalid bila backend restart dengan `SESSION_SECRET` berbeda (saat ini statis di .env).
