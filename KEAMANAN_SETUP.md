# Implementasi Keamanan - Quick Start

## ✅ Sudah Diterapkan

### 1. Backup Otomatis ✓
- File: `backup.js`
- Backup dilakukan setiap kali server start
- Folder: `backups/` (auto-created)
- Retention: 30 hari otomatis dihapus
- **Cara kerja:** Saat `npm start`, database di-backup ke folder `backups/`

### 2. Admin Password ✓
- File: `admin.html` (baris 45-63)
- **Password default:** `Desa2024`
- Setiap buka admin panel, akan minta password
- Session password hilang saat close browser

---

## 🔐 LANGKAH 1: Ganti Password Admin

**Edit file: `admin.html`** (baris ~52)

Temukan:
```javascript
const ADMIN_PASSWORD = 'Desa2024'; // 🔓 GANTI PASSWORD INI!
```

Ganti dengan password pilihan Anda:
```javascript
const ADMIN_PASSWORD = 'KantorDesa2024Aman'; // Password lebih kuat!
```

**Tips password yang baik:**
- Minimal 8 karakter
- Campuran huruf + angka + simbol
- Jangan password yang obvious (tanggal lahir, nama desa, dll)
- Contoh: `D3s4_S3cur3_2024!`

---

## 📦 LANGKAH 2: Setup Backup Otomatis (Optional)

Untuk backup yang dijadwalkan setiap 6 jam:

```bash
npm install node-schedule
```

Selesai! Backup akan otomatis berjalan setiap jam 00:00, 06:00, 12:00, 18:00 (jika server terus running).

Jika tidak install `node-schedule`, backup tetap jalan **manual saat server start** saja.

---

## 📁 Struktur Folder Setelah Backup

```
ProjectKantorDesa/
├── server.js
├── admin.html
├── surat.html
├── index.html
├── assets/
├── backup.js          ← File backup (baru)
├── desa_surat.db      ← Database utama
├── package.json
└── backups/           ← Folder backup (auto-created)
    ├── desa_surat_2025-01-27_14-30.db
    ├── desa_surat_2025-01-27_20-15.db
    └── desa_surat_2025-01-28_02-00.db
```

---

## ✅ Cek Backup Berjalan

1. **Start server:**
   ```bash
   npm start
   ```

2. **Lihat output:**
   ```
   ✓ Backup berhasil: backups/desa_surat_2025-01-27_14-30.db
   ✓ Backup scheduler aktif (setiap 6 jam)
   Server berjalan di http://localhost:3000
   ```

3. **Cek folder `backups/`:**
   - Jika ada file `.db` = backup berhasil ✓

---

## 🚨 Disaster Recovery - Restore Database

Jika database corrupted atau hilang, restore dari backup:

**Windows (PowerShell/CMD):**
```powershell
# 1. Stop server (Ctrl+C di terminal)

# 2. Copy file backup terbaru
copy backups\desa_surat_2025-01-27_14-30.db desa_surat.db

# 3. Start server lagi
npm start
```

**Linux/Mac:**
```bash
# 1. Stop server (Ctrl+C)

# 2. Restore backup
cp backups/desa_surat_2025-01-27_14-30.db desa_surat.db

# 3. Start server
npm start
```

---

## 🛡️ Checklist Keamanan Mingguan

- [ ] Cek folder `backups/` ada backup terbaru
- [ ] Semua petugas tahu password admin (jangan share chat, kalau perlu temu langsung)
- [ ] Server hanya accessible di local network (tidak di-expose ke internet)
- [ ] Database file (`desa_surat.db`) tidak ada di folder public website

---

## ⚠️ Jangan Lakukan INI

❌ **Jangan:**
- Ganti password terus-menerus (catat di tempat aman)
- Share password via WhatsApp/email (berbahaya)
- Backup ke folder yang mudah diakses publik
- Pindahkan database ke folder `www/` atau `public/`

---

## 🔄 Upgrade Keamanan Kemudian

Ketika siap (minggu depan/bulan depan):

1. **MySQL Database** - lebih aman dari SQLite
2. **Login System** - username + password proper
3. **Audit Logs** - catat siapa ubah apa
4. **HTTPS/SSL** - enkripsi data saat transmisi
5. **2FA** - two-factor authentication

Untuk sekarang, sistem ini **cukup aman untuk desa**. 

---

## 📞 Pertanyaan?

Tanya tim IT Anda atau hubungi yang setup sistem ini.

---

**Tanggal Setup:** 27 Januari 2025
**Status:** ✅ Backup + Password Protection aktif
