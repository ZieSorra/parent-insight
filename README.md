# ZIESORRA — Parent Insight

Frontend Parent Insight untuk membantu guru menggabungkan bukti akademik dengan hasil wawancara orang tua dan merencanakan tindak lanjut peserta didik.

> **Status:** frontend/prototipe. Data saat ini masih berupa data contoh lokal. Supabase belum dihubungkan; jangan gunakan data pribadi peserta didik sungguhan sebelum autentikasi, kebijakan akses, dan penyimpanan data disiapkan.

## Teknologi

- React + TypeScript
- Vite
- Tailwind CSS melalui plugin Vite
- Lucide React

## Menjalankan secara lokal

**Prasyarat:** Node.js 20.19+ atau 22.12+ dan npm.

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal.

## Memeriksa proyek

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` menghasilkan folder `dist/`. Jalankan `npm run preview` untuk memeriksa hasil build lokal.

## Publikasi ke GitHub Pages

Konfigurasi Vite sudah menggunakan base path `/parent-insight/`, sesuai nama repositori proyek ini.

1. Buat repositori GitHub bernama **parent-insight**.
2. Unggah isi folder proyek ini ke root repositori (termasuk `package.json`, `vite.config.ts`, `index.html`, dan `src/`). Jangan unggah folder `node_modules/`.
3. Di GitHub, buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **GitHub Actions**.
5. Tambahkan workflow `.github/workflows/deploy.yml` yang menjalankan `npm ci` (jika `package-lock.json` tersedia; jika belum, gunakan `npm install`), `npm run build`, lalu unggah dan deploy artefak `dist/` menggunakan actions resmi GitHub Pages.
6. Setelah workflow sukses, situs akan tersedia di `https://<USERNAME>.github.io/parent-insight/`.

Ganti `<USERNAME>` dengan nama akun GitHub. Untuk repositori proyek, jangan mengubah `base` menjadi `/` kecuali nantinya memakai domain kustom atau GitHub Pages user-site.

## Tahun ajaran dan data contoh

Tahun ajaran awal yang dipilih adalah **2026/2027 — Ganjil**. Opsi 2024/2025 dan 2023/2024 dipertahankan sebagai arsip/contoh historis. Mengubah pilihan tahun ajaran di UI belum berarti data contoh otomatis difilter atau tersimpan ke database.

## Keamanan dan integrasi backend

- Supabase belum dihubungkan pada paket ini.
- Jangan commit `.env.local`, token, password, service-role key, atau kredensial lainnya.
- Rahasia tidak boleh diletakkan dalam kode frontend atau variabel `VITE_*`.
- Sebelum digunakan dengan data nyata, siapkan autentikasi, Row Level Security (RLS), dan kebijakan akses yang sesuai.
