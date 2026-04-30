# Portal Surat Desa (AdminLTE + Offline-First + Backend Terpusat)

Website untuk pemerintahan desa: warga membuat surat keterangan (Surat Keterangan Usaha, dll.) dan admin mengelola permintaan dengan:
- **Offline-First**: Aplikasi tetap berfungsi meski offline
- **Sinkronisasi Otomatis**: Data sinkronisasi ke server pusat saat online
- **Data Terpusat**: Semua komputer admin melihat data yang sama

## Fitur

- **Frontend**: Form pengajuan surat, preview, PDF, cetak
- **Offline Support**: Simpan data ke LocalStorage saat offline
- **Backend**: REST API dengan SQLite, data terpusat
- **Sinkronisasi**: Auto-sync saat online, indikator status (🟢 Online / 🔴 Offline)
- **Duplikat Detection**: Cegah data ganda (NIK + Nama + Tanggal yang sama)

## Instalasi

### 1. Install Node.js
Download dari https://nodejs.org (LTS version), lalu install.

### 2. Install Dependencies
```bat
cd /d d:\ProjectKantorDesa
npm install
```

### 3. Jalankan Backend
```bat
npm start
```
Backend berjalan di `http://localhost:3000`.

### 4. Akses Frontend
- **Lokal**: `http://localhost:3000`
- **Dari komputer lain**: `http://<IP_KOMPUTER_PUSAT>:3000`

## Cara Pakai

### Mode Online (Ada WiFi)
1. **Warga**: Buka "Buat Surat" → isi form → klik "Simpan ke Database"
2. **Admin**: Buka "Panel Admin" → lihat daftar real-time → ubah status

### Mode Offline (Tanpa WiFi)
1. **Warga**: Buka "Buat Surat" → isi form → klik "Simpan ke Database"
   - Data disimpan di **LocalStorage** (browser lokal)
   - Muncul pesan kuning "Mode Offline"
2. **Admin**: Buka "Panel Admin" → lihat data lokal (dari LocalStorage)
3. **Saat Online**: Data otomatis sinkronisasi ke server pusat

**Indikator Status:**
- 🟢 **Online** = Terhubung ke server
- 🔴 **Offline** = Mode offline, data disimpan lokal

## Database

File: `desa_surat.db` (SQLite)

Tabel `surat`:
- `nama`, `nik`, `alamat`, `nama_usaha`, `jenis_usaha`, `tujuan`, `tanggal`
- `status`: draft, disetujui, ditolak
- `created_at`, `updated_at`

## LocalStorage

File: Browser LocalStorage (key: `desa_surat_pending`)

Menyimpan surat yang belum sinkronisasi saat offline:
```json
[
  {
    "id": "pending_1234567890",
    "nama": "Budi",
    "nik": "123456",
    "synced": false,
    "server_id": null
  }
]
```

Saat online, data otomatis dipindah ke server dan `synced` menjadi `true`.

## Customisasi

- **Ubah nama desa**: Edit "Portal Desa" di HTML files
- **Tambah jenis surat**: Duplikasi form di `surat.html` + update `server.js`
- **Ubah warna**: Modifikasi `assets/css/custom.css`

## Troubleshooting

- **Tidak bisa sync dari offline ke online**: Buka DevTools (F12) → Console → cek error. Pastikan server berjalan dengan `npm start`.
- **Data hilang saat offline**: Data disimpan di LocalStorage. Jangan clear browser cache/data.
- **Server tidak bisa diakses dari komputer lain**: Cek firewall Windows, izinkan Node.js. Atau gunakan IP lokal (run `ipconfig` untuk cek).

