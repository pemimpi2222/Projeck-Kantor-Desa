# Database Warga - User Guide

## Fitur Database Warga

Sistem database warga untuk mencatat dan manage data penduduk desa dengan mudah.

---

## 📋 Akses Database Warga

**URL:** `http://localhost:3000/warga.html`

Atau dari menu: **Beranda > Database Warga**

---

## ➕ Cara Tambah Warga Baru

1. Buka halaman **Database Warga**
2. Isi form di bagian atas:
   - **NIK** *(wajib)* - Nomor Identitas (harus unik, tidak boleh sama)
   - **Nama** *(wajib)* - Nama lengkap
   - **Alamat** - Alamat rumah
   - **Nomor KK** - Nomor Kartu Keluarga
   - **No. HP** - Nomor handphone
   - **Pekerjaan** - Jenis pekerjaan
   - **Status Pernikahan** - Belum Menikah / Menikah / Cerai Hidup / Cerai Mati
   - **Keterangan** - Catatan tambahan (opsional)

3. Klik **"Simpan Warga"**
4. Jika berhasil, data akan muncul di daftar bawah

---

## ✏️ Cara Edit Warga

1. Cari warga di tabel dengan tombol search (🔍)
2. Klik tombol **"✏️ Edit"** pada baris warga
3. Form akan otomatis terisi dengan data warga
4. Ubah data yang ingin diubah
5. Klik **"Update Warga"**
6. Data akan ter-update di database

---

## 🗑️ Cara Hapus Warga

1. Klik tombol **"🗑️ Hapus"** pada baris warga yang ingin dihapus
2. Konfirmasi dengan "OK" saat diminta
3. Warga akan dihapus dari database

---

## 🔍 Cara Search Warga

Gunakan kotak search **"🔍 Cari warga"** di atas tabel untuk cari:
- Berdasarkan **Nama**
- Berdasarkan **NIK**

Ketik nama atau NIK, tabel akan otomatis filter.

---

## 📊 Kolom Data di Tabel

| Kolom | Keterangan |
|-------|-----------|
| # | Nomor urut |
| NIK | Nomor Identitas |
| Nama | Nama warga |
| Alamat | Alamat rumah |
| No. KK | Nomor Kartu Keluarga |
| No. HP | Nomor handphone |
| Pekerjaan | Jenis pekerjaan |
| Status | Status pernikahan |
| Aksi | Tombol Edit / Hapus |

---

## ⚙️ API Endpoints (Developer Info)

### POST - Tambah Warga
```
POST /api/warga
```
**Request:**
```json
{
  "nik": "3274xxx",
  "nama": "Budi Santoso",
  "alamat": "Jl. Merdeka No. 10",
  "nomor_kk": "3274xxx",
  "no_hp": "08123456789",
  "pekerjaan": "Petani",
  "status_pernikahan": "Menikah",
  "keterangan": "Warga tetap"
}
```

### GET - Ambil Semua Warga
```
GET /api/warga
```

### GET - Ambil Warga by ID
```
GET /api/warga/:id
```

### PUT - Update Warga
```
PUT /api/warga/:id
```

### DELETE - Hapus Warga
```
DELETE /api/warga/:id
```

---

## 💾 Database Schema

```sql
CREATE TABLE warga (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nik TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  alamat TEXT,
  nomor_kk TEXT,
  no_hp TEXT,
  pekerjaan TEXT,
  status_pernikahan TEXT,
  keterangan TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## ❌ Error & Troubleshooting

**Error: "NIK sudah terdaftar"**
- NIK yang Anda masukkan sudah ada di database
- Solusi: Gunakan NIK yang berbeda atau edit warga yang sudah ada

**Error: "Sistem offline"**
- Koneksi internet terputus
- Solusi: Periksa WiFi/koneksi, coba refresh halaman

**Tabel kosong**
- Data belum ditambahkan
- Solusi: Tambah warga baru melalui form

---

## 📝 Tips & Best Practice

1. **NIK Unik:** Pastikan setiap warga punya NIK berbeda
2. **Data Lengkap:** Isi data selenglap mungkin untuk kemudahan pencarian
3. **Backup Regular:** Data warga tersimpan di database `desa_surat.db`
4. **Privasi:** Jaga kerahasiaan data warga, jangan bagikan kepada pihak tidak terkait

---

## 🔒 Keamanan Data

- Data tersimpan encrypted di database SQLite
- Hanya authorized users yang bisa akses (via admin password)
- Backup otomatis dilakukan setiap kali server start

---

**Pertanyaan?** Hubungi tim IT yang setup sistem ini.
