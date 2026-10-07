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

### Alur pengelolaan pesanan dan transaksi

#### Persiapan satu kali

1. Pastikan `schema.sql` sudah dijalankan agar fungsi dan profil admin (`public.is_admin()`) tersedia.
2. Buka **Supabase → SQL Editor → New query**.
3. Salin dan jalankan seluruh isi [supabase/orders-migration.sql](supabase/orders-migration.sql). Script ini membuat tabel pesanan, mengaktifkan Row Level Security, dan memberi akses baca, ubah status, serta hapus hanya kepada admin.
4. Refresh aplikasi setelah query berhasil. Jika sebelumnya muncul `permission denied for table orders`, pastikan query ini berhasil dijalankan pada project Supabase yang sama dengan URL di `.env`/environment deployment.

#### Saat pelanggan memesan

1. Pelanggan mengisi halaman **Detail Order** dan menekan **Order via WhatsApp**.
2. Website menyimpan data pesanan ke tabel `orders` dengan status awal **Menunggu verifikasi**, lalu membuka WhatsApp berisi rincian dan kode pesanan, misalnya `HMP-261007-A1B2C3D4E5F6`.
3. Jika penyimpanan gagal, WhatsApp tidak dibuka dan website menampilkan pesan error. Ini membantu mencegah pesanan yang tidak tercatat.

#### Verifikasi oleh admin

1. Admin login dengan akun yang role-nya `admin`, lalu buka panel **Kelola**.
2. Di bagian **Pesanan pelanggan**, tinjau kode pesanan, nama dan nomor pelanggan, rincian produk, metode pengiriman, dan total. Cocokkan pesanan dengan percakapan WhatsApp serta bukti pembayaran atau konfirmasi yang digunakan.
3. Klik **Refresh pesanan** jika pesanan yang baru dibuat belum terlihat.
4. Setelah transaksi benar-benar diverifikasi, klik **Tandai berhasil**. Status **Berhasil** berarti sudah dikonfirmasi admin; pesan WhatsApp saja bukan bukti pembayaran.
5. Jika pesanan batal, klik **Batalkan**. Jika status perlu dikoreksi, gunakan **Kembalikan ke menunggu** atau pilih status yang sesuai.
6. **Hapus pesanan** menghapus catatan secara permanen dari database setelah admin menyetujui konfirmasi. Untuk pencatatan transaksi, lebih aman mengubah status menjadi **Dibatalkan** daripada menghapus riwayat.

#### Ekspor data berhasil ke Excel

1. Pastikan hanya pesanan yang sudah diverifikasi berstatus **Berhasil**.
2. Klik **Ekspor Excel**. Angka di tombol menunjukkan jumlah pesanan berhasil yang akan diekspor; status menunggu dan dibatalkan tidak disertakan.
3. File yang diunduh berformat CSV UTF-8 dan dapat langsung dibuka di Excel. Untuk file Excel asli, pilih **Save As / Simpan Sebagai → Excel Workbook (`.xlsx`)**.

**Catatan:** status transaksi tidak terdeteksi otomatis dari WhatsApp. Admin perlu memeriksa percakapan dan pembayaran terlebih dahulu. Jangan menandai pesanan berhasil hanya karena pelanggan menekan tombol order atau membuka WhatsApp.

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

## Tutorial Hosting Gratis dengan Vercel

### 1. Import repository GitHub

1. Buka [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub.
2. Pilih **Add New → Project**.
3. Import repository `HampersNatalGPdi`. Jika tidak muncul, pilih **Configure GitHub App** dan izinkan Vercel mengakses repository tersebut.

### 2. Atur build aplikasi

Pada halaman konfigurasi project, gunakan pengaturan berikut:

- **Root Directory:** `./` karena root repository Git berada di folder `hampers-app`.
- **Framework Preset:** `Vite`.
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.

### 3. Tambahkan environment variables

Di bagian **Environment Variables**, tambahkan dua variabel berikut dan salin nilainya dari file `.env` lokal:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Aktifkan setidaknya untuk environment **Production**. Tambahkan juga ke **Preview** jika ingin menguji deployment preview. Jangan mengunggah file `.env` atau menggunakan key `service_role`; gunakan key publik `anon` atau `publishable`.

### 4. Deploy dan periksa hasilnya

1. Klik **Deploy** dan tunggu sampai deployment berstatus **Ready**.
2. Buka domain produksi yang diberikan Vercel, biasanya berakhiran `.vercel.app`.
3. Push commit baru ke branch `main` untuk memicu deployment berikutnya.

Jika dashboard menampilkan **No Production Deployment**:

- Buka **Deployments** dan periksa apakah ada deployment.
- Jika belum ada, pastikan repository sudah terhubung di **Settings → Git**, lalu mulai deployment.
- Pastikan production branch adalah `main`.
- Jika deployment berstatus **Error**, buka **Build Logs**, perbaiki error yang ditampilkan, lalu deploy ulang.
- Jika environment variables baru saja diubah, jalankan **Redeploy** agar nilainya dipakai saat build.

### 5. Izinkan URL Vercel di Supabase Auth

Ganti `nama-project.vercel.app` dengan domain produksi yang benar-benar diberikan Vercel:

1. Di Supabase, buka **Authentication → URL Configuration**.
2. Isi **Site URL** dengan URL utama Vercel tanpa path, misalnya `https://nama-project.vercel.app`.
3. Tambahkan `https://nama-project.vercel.app/**` ke **Redirect URLs**.
4. Tambahkan `http://localhost:5173/**` juga jika alamat lokal masih digunakan untuk development.
5. Klik **Save**.

Site URL dan Redirect URLs di atas menggunakan domain website dari Vercel, bukan URL backend Supabase.

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
