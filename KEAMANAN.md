# Panduan Keamanan Sistem Portal Desa

## 1. BACKUP DATA REGULAR

**Penting:** Selalu backup file database sebelum terjadi hal yang tidak diinginkan.

### Setup Backup Otomatis

Buat file `backup.js` di folder project:

```javascript
// backup.js
const fs = require('fs');
const path = require('path');

function backupDatabase() {
  const sourceFile = 'desa_surat.db';
  const backupDir = 'backups';
  
  // Buat folder backups jika belum ada
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Nama file backup dengan tanggal
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `desa_surat_${timestamp}.db`);
  
  // Copy file
  fs.copyFileSync(sourceFile, backupFile);
  console.log(`✓ Backup berhasil: ${backupFile}`);
  
  // Hapus backup yang lebih dari 30 hari
  const files = fs.readdirSync(backupDir);
  files.forEach(file => {
    const filePath = path.join(backupDir, file);
    const stat = fs.statSync(filePath);
    const ageInDays = (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 30) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Hapus backup lama: ${file}`);
    }
  });
}

// Jalankan backup setiap hari jam 2 pagi
const schedule = require('node-schedule');
schedule.scheduleJob('0 2 * * *', backupDatabase);

console.log('✓ Backup scheduler aktif');
```

Update `package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "sqlite3": "^5.1.0",
    "cors": "^2.8.5",
    "body-parser": "^1.20.0",
    "node-schedule": "^2.1.1"
  }
}
```

Jalankan: `npm install node-schedule`

Update `server.js` (tambah di awal):
```javascript
require('./backup.js'); // Aktifkan backup otomatis
```

---

## 2. VALIDASI INPUT (Cegah SQL Injection)

Gunakan **prepared statements** (sudah ada di server.js). Pastikan:

✅ Server.js sudah menggunakan:
```javascript
db.run('INSERT INTO surat (nama, nik, ...) VALUES (?, ?, ...)', [nama, nik, ...])
```

**JANGAN PERNAH:**
```javascript
// ❌ BERBAHAYA - Bisa SQL injection
db.run(`INSERT INTO surat VALUES ('${nama}', '${nik}')`)
```

---

## 3. KONTROL AKSES - ADD ADMIN PASSWORD

Tambah authentication sederhana di admin.html:

```javascript
// Di admin.html, dalam <script> tag, di awal DOMContentLoaded:
document.addEventListener('DOMContentLoaded', () => {
  // Cek login pertama kali
  if (!sessionStorage.getItem('adminLoggedIn')) {
    const password = prompt('Masukkan password admin:');
    if (password !== 'GANTI_DENGAN_PASSWORD_KUAT') {
      alert('Password salah!');
      window.location.href = 'index.html';
      return;
    }
    sessionStorage.setItem('adminLoggedIn', 'true');
  }
  
  // ... kode lainnya ...
});
```

**Instruksi:**
1. Ganti `'GANTI_DENGAN_PASSWORD_KUAT'` dengan password yang aman (misal: `'DesaAman2024'`)
2. Bagikan password hanya ke petugas desa yang ditunjuk
3. Jangan hardcode password di kode jangka panjang—sebaiknya request ke server (upgrade kemudian)

---

## 4. BATASI AKSES NETWORK

**Server hanya dengarkan local network, bukan internet public:**

Server.js sudah benar:
```javascript
app.listen(3000, '0.0.0.0', ...)  // 0.0.0.0 = semua interface local
```

Cara akses:
- **Dari komputer server:** `http://localhost:3000`
- **Dari komputer lain (same WiFi):** `http://[IP_SERVER]:3000` (contoh: `http://192.168.1.100:3000`)

**JANGAN expose ke internet** - jika perlu public, gunakan VPN atau HTTPS dengan SSL cert.

---

## 5. ENKRIPSI DATA SENSITIVE (Opsional - Advanced)

Untuk enkripsi NIK/nama sebelum simpan ke database (lebih aman):

```bash
npm install bcrypt
```

Di server.js, import:
```javascript
const bcrypt = require('bcrypt');
```

Saat insert surat, hash NIK:
```javascript
app.post('/api/surat', async (req, res) => {
  const data = req.body;
  const hashedNIK = await bcrypt.hash(data.nik, 10);
  
  db.run(`INSERT INTO surat (nama, nik, ...) VALUES (?, ?, ...)`, 
    [data.nama, hashedNIK, ...], 
    function(err) { ... });
});
```

**Catatan:** Jika hash NIK, tidak bisa search/filter by NIK lagi. Untuk now, skip ini.

---

## 6. CHECKLIST KEAMANAN HARIAN

- [ ] Server running (`npm start`)
- [ ] Database tidak expose ke folder public
- [ ] Hanya admin tahu password admin
- [ ] Backup dilakukan otomatis (cek folder `backups/`)
- [ ] Network local saja, tidak internet public

---

## 7. PROSEDUR BACKUP MANUAL (Jika Backup Otomatis Fail)

**Windows (CMD):**
```powershell
# Copy database file ke USB/cloud
copy desa_surat.db D:\Backup\desa_surat_backup_[TANGGAL].db
```

**Linux/Mac:**
```bash
cp desa_surat.db ~/Backup/desa_surat_backup_$(date +%Y%m%d).db
```

---

## 8. DISASTER RECOVERY - Restore Dari Backup

Jika database corrupt:

```bash
# 1. Stop server
# 2. Restore dari backup
copy backups\desa_surat_[TIMESTAMP].db desa_surat.db

# 3. Start server lagi
npm start
```

---

## 9. UPGRADE KEMUDIAN (Roadmap)

Ketika siap upgrade keamanan lebih tinggi:

1. **Add MySQL** - lebih aman dari SQLite
2. **Add Login system** - username/password proper dengan JWT tokens
3. **Add HTTPS/SSL** - enkripsi data saat transmisi
4. **Add Audit logs** - catat siapa ubah apa dan kapan
5. **Add 2FA** - two-factor authentication untuk admin

---

## SUMMARY SEKARANG

**Sistem sudah aman untuk:**
- ✅ Local network small scale (1-2 petugas)
- ✅ Data backup regular
- ✅ Input validation (SQL injection protection)
- ✅ Network tidak expose ke internet

**Kurang:**
- ⏳ Admin password (sudah ditambah di atas)
- ⏳ Audit logs
- ⏳ Encryption
- ⏳ HTTPS

Untuk keamanan "level desa", sistem ini sudah cukup. Jika ada masalah keamanan kemudian, bisa upgrade ke MySQL + proper authentication.

---

**Pertanyaan?** Tanya saja!
