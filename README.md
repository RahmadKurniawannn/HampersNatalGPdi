# GPDI Hampers

## Tutorial Supabase Admin

### 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) dan login.
2. Pilih **New project**.
3. Isi nama project, password database, dan region.
4. Tunggu sampai project selesai dibuat.

### 2. Ambil kredensial aplikasi

1. Buka **Project Settings**.
2. Pilih menu **API**.
3. Salin **Project URL**.
4. Salin key **Publishable key** atau **anon public key**.
5. Di folder `hampers-app`, salin `.env.example` menjadi `.env`.
6. Isi file `.env`:

```env
VITE_SUPABASE_URL=https://project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Jangan masukkan `service_role` key ke `.env` frontend atau ke GitHub. Aplikasi ini hanya membutuhkan key publik.

### 3. Buat tabel profil dan role

1. Di dashboard Supabase, buka **SQL Editor**.
2. Pilih **New query**.
3. Buka file [supabase/schema.sql](supabase/schema.sql) dari project ini.
4. Salin seluruh isinya ke SQL Editor.
5. Klik **Run**.

Script tersebut membuat tabel `profiles`, tabel `products`, bucket Storage `product-images`, menghubungkan user dengan profil, mengaktifkan RLS, dan memberi role awal `pending`.

### 4. Atur verifikasi email

1. Buka **Authentication** lalu **Providers**.
2. Pastikan provider **Email** aktif.
3. Untuk development, email confirmation boleh dimatikan agar bisa langsung login.
4. Untuk production, sebaiknya email confirmation tetap aktif dan SMTP dikonfigurasi.

### 5. Jalankan aplikasi

```bash
npm install
npm run dev
```

Buka URL Vite yang muncul di terminal, biasanya `http://localhost:5173`.

### 6. Daftarkan akun admin

1. Klik tombol **Kelola** di navbar.
2. Pada halaman login, klik **Daftar admin baru**.
3. Masukkan email dan password.
4. Konfirmasi email jika fitur email confirmation aktif.

Route register tidak ditampilkan di navbar publik, tetapi tersedia dari halaman login admin.

### 7. Beri role admin

Akun baru belum bisa masuk panel karena role awalnya `pending`. Buka kembali **SQL Editor** dan jalankan:

```sql
update public.profiles
set role = 'admin'
where email = 'email-admin-kamu@example.com';
```

Ganti email contoh dengan email yang benar-benar digunakan saat register.

### 8. Login ke panel

1. Kembali ke aplikasi.
2. Klik **Kelola**.
3. Masukkan email dan password admin.
4. Setelah role terbaca sebagai `admin`, panel katalog akan terbuka.

Jika muncul pesan **akun belum memiliki akses admin**, periksa email pada tabel `profiles` dan pastikan nilainya sudah `admin`.

Jika muncul **Could not find the table `public.products` in the schema cache**, buka SQL Editor dan jalankan seluruh file [supabase/products-migration.sql](supabase/products-migration.sql). Pastikan query berhasil tanpa error, lalu refresh aplikasi. File ini adalah setup mandiri untuk profil admin, tabel produk, dan bucket gambar.

### Catatan keamanan dan data

- Menyembunyikan route register bukan pengaman utama; akses panel dikontrol oleh `profiles.role`.
- Jangan menggunakan `service_role` key di frontend.
- Fungsi pengecekan role hanya dapat dipanggil oleh user authenticated.
- Operasi tambah, edit, dan hapus produk dibatasi dengan Row Level Security untuk role `admin`.
- Upload gambar dibatasi dengan policy Storage untuk role `admin`; gambar hanya bersifat public agar bisa tampil di katalog.
- Supabase dipakai untuk autentikasi, role admin, data katalog, dan gambar produk.
- Produk baru, edit produk, hapus produk, serta upload gambar dari panel admin tersimpan di Supabase.
- Produk awal tetap dipakai sebagai fallback sampai ada data produk di tabel `products`.

### Promosi admin tambahan

Untuk membuat admin kedua, daftarkan akun baru dari halaman login lalu jalankan query yang sama:

```sql
update public.profiles
set role = 'admin'
where email = 'email-admin-kamu@example.com';
```

## Tutorial Push ke GitHub

### 1. Buat repository GitHub

1. Buat repository baru di GitHub.
2. Jangan pilih opsi untuk menambahkan README, `.gitignore`, atau lisensi karena file proyek sudah tersedia.

### 2. Siapkan folder proyek

Buka PowerShell di folder `hampers-app`:

```powershell
cd "C:\Users\NamaKamu\OneDrive\Documents\ProjectWEB\Hampers\hampers-app"
```

File `.env` sudah dikecualikan oleh `.gitignore`, sedangkan `.env.example` boleh diunggah karena hanya berisi nilai contoh. Pastikan `.env` diabaikan:

```powershell
git check-ignore -v .env
```

### 3. Stage dan commit file

Jika folder ini belum menjadi Git repository, inisialisasi branch `main`:

```powershell
git init -b main
```

Stage dan periksa file sebelum commit. Pastikan `.env` tidak muncul di daftar:

```powershell
git add .
git status --short
```

Lalu buat commit pertama:

```powershell
git commit -m "Initial project"
```

### 4. Hubungkan dan push ke GitHub

Ganti URL berikut jika nama akun atau repository berbeda. Jalankan `git remote add` hanya jika remote `origin` belum ada:

```powershell
git remote add origin https://github.com/RahmadKurniawannn/HampersNatalGPdi.git
git push -u origin main
```

Jika `origin` sudah terdaftar tetapi URL-nya salah, perbarui dengan:

```powershell
git remote set-url origin https://github.com/RahmadKurniawannn/HampersNatalGPdi.git
```

### Mengatasi push yang gagal

Jika muncul `src refspec main does not match any` atau `failed to push some refs`, periksa apakah sudah ada commit:

```powershell
git status --short --branch
git log --oneline -1
```

Jika belum ada commit, jalankan `git add .`, pastikan `.env` tidak terdaftar, lalu jalankan `git commit -m "Initial project"` sebelum `git push -u origin main`.

Jika repository GitHub sudah memiliki commit awal dan push ditolak karena branch berbeda, sinkronkan dulu tanpa menimpa riwayat:

```powershell
git pull --rebase origin main
git push -u origin main
```

Jangan gunakan `git push --force` untuk mengatasi penolakan biasa karena dapat menimpa riwayat di GitHub.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
