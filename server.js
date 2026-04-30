const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'rahasia_negara_jangan_disebar';

// === 1. KONFIGURASI DATABASE ===
const dbConfig = {
    host: 'sql.freedb.tech', // Sesuaikan dengan Host dari FreeDB
    port: 3306,              // Biarkan 3306 (Port standar MySQL online)
    user: 'freedb_Sponginc', // Sesuaikan dengan User dari FreeDB
    password: 'Yp3fs5P*?dp!JN!', // Sesuaikan dengan Password dari FreeDB
    database: 'freedb_ProjectKantorDesa'       // Sesuaikan dengan DB Name dari FreeDB
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Helper: Log Activity
async function logActivity(actorName, action, desc) {
    try {
        const detailedDesc = `[${actorName}] ${desc}`;
        await pool.query('INSERT INTO logs (action, description) VALUES (?, ?)', [action, detailedDesc]);
    } catch (err) { console.error("Gagal log:", err); }
}

// ================= 2. KEAMANAN & LOGIN (SUDAH BCRYPT) =================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // CCTV 1: Mengecek apa yang dikirim dari HTML ke Server
    console.log("=== DETEKTIF LOGIN ===");
    console.log("1. Dikirim dari Web -> Username:", username, "| Password:", password);

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        // CCTV 2: Mengecek apa yang ditemukan Server di dalam Database FreeDB
        console.log("2. Ditemukan di DB ->", rows);

        if (rows.length > 0) {
            const user = rows[0];
            
            // CCTV 3: Membandingkan secara langsung
            console.log("3. Pencocokan -> Input:", password, "VS Database:", user.password);

            const isMatch = (password === user.password);

            if (isMatch) {
                console.log("4. HASIL: COCOK! Login Sukses.");
                const token = jwt.sign({ username: user.username, role: user.role, name: user.nama_lengkap }, SECRET_KEY, { expiresIn: '24h' });
                await logActivity(user.nama_lengkap, 'LOGIN', `Berhasil masuk ke sistem.`);
                res.json({ success: true, token, name: user.nama_lengkap, role: user.role });
            } else {
                console.log("4. HASIL: GAGAL COCOK!");
                res.status(401).json({ success: false, message: "Username/Password Salah!" });
            }
        } else {
            console.log("HASIL: Username tidak ditemukan di database!");
            res.status(401).json({ success: false, message: "Username/Password Salah!" });
        }
    } catch (err) { 
        console.error("ERROR SISTEM:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "Butuh Login" });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Token Expired" });
        req.user = user;
        next();
    });
}

// ================= 3. API WARGA =================
app.get('/api/warga', async (req, res) => {
    const isDeleted = req.query.deleted === 'true' ? 1 : 0;
    try {
        const [rows] = await pool.query('SELECT * FROM warga WHERE is_deleted = ? ORDER BY nama ASC', [isDeleted]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/warga', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        // Tambahkan pendidikan di SQL dan values
        const sql = `INSERT INTO warga (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, status_perkawinan, pekerjaan, pendidikan, nomor_kk, no_hp, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [d.nik, d.nama, d.tempat_lahir, d.tanggal_lahir, d.jenis_kelamin, d.alamat, d.agama, d.status_perkawinan, d.pekerjaan, d.pendidikan, d.nomor_kk, d.no_hp, d.keterangan];
        await pool.query(sql, values);
        
        await logActivity(req.user.name, 'TAMBAH WARGA', `Mendaftarkan warga baru: ${d.nama}`);
        res.json({ message: "Sukses" });
    } catch (err) { res.status(500).json({ error: "Gagal: " + err.message }); }
});

app.put('/api/warga/:id', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        // Tambahkan pendidikan di SQL dan values
        const sql = `UPDATE warga SET nik=?, nama=?, tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, alamat=?, agama=?, status_perkawinan=?, pekerjaan=?, pendidikan=?, nomor_kk=?, no_hp=?, keterangan=? WHERE id=?`;
        const values = [d.nik, d.nama, d.tempat_lahir, d.tanggal_lahir, d.jenis_kelamin, d.alamat, d.agama, d.status_perkawinan, d.pekerjaan, d.pendidikan, d.nomor_kk, d.no_hp, d.keterangan, req.params.id];
        await pool.query(sql, values);
        
        await logActivity(req.user.name, 'EDIT WARGA', `Mengubah data milik warga ID ${req.params.id}`);
        res.json({ message: "Sukses" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/warga/:id', authenticateToken, async (req, res) => {
    try { 
        await pool.query("UPDATE warga SET is_deleted = 1 WHERE id = ?", [req.params.id]); 
        await logActivity(req.user.name, 'HAPUS WARGA', `Memindahkan data Warga ID ${req.params.id} ke tempat sampah`);
        res.json({ message: "Ok" }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/warga/:id/restore', authenticateToken, async (req, res) => {
    try { 
        await pool.query("UPDATE warga SET is_deleted = 0 WHERE id = ?", [req.params.id]); 
        await logActivity(req.user.name, 'RESTORE WARGA', `Memulihkan data Warga ID ${req.params.id}`);
        res.json({ message: "Ok" }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/warga/:id/permanen', authenticateToken, async (req, res) => {
    try { 
        await pool.query("DELETE FROM warga WHERE id = ?", [req.params.id]); 
        await logActivity(req.user.name, 'HAPUS PERMANEN', `Menghapus permanen data Warga ID ${req.params.id}`);
        res.json({ message: "Ok" }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= 4. API SURAT =================

app.get('/api/surat', async (req, res) => {
    const isDeleted = req.query.deleted === 'true' ? 1 : 0;
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, nomor_urut, jenis_surat, nama_pemohon as nama, nik_pemohon as nik, nama_usaha, 
                alamat, tanggal_surat as tanggal, status, tujuan, isi_kustom, tempat_lahir,
                tanggal_lahir, jenis_kelamin, agama, pekerjaan, status_perkawinan
            FROM surat 
            WHERE is_deleted = ? 
            ORDER BY id DESC
        `, [isDeleted]);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.post('/api/surat', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        const [resMax] = await pool.query('SELECT MAX(nomor_urut) as m FROM surat WHERE YEAR(tanggal_surat) = YEAR(?)', [d.tanggal]);
        const nextNo = (resMax[0].m || 0) + 1;

        const sql = `INSERT INTO surat (nomor_urut, jenis_surat, nama_pemohon, nik_pemohon, nama_usaha, alamat, tanggal_surat, status, tujuan, isi_kustom, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, 0)`;
        const values = [nextNo, d.jenis_surat, d.nama, d.nik, d.nama_usaha, d.alamat, d.tanggal, d.tujuan || '', d.isi_kustom || null];

        await pool.query(sql, values);
        
        await logActivity(req.user.name, 'BUAT SURAT', `Membuat Surat ${d.jenis_surat.toUpperCase()} untuk ${d.nama}`);
        res.json({ message: 'Surat berhasil!', nomor_urut: nextNo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/warga/ajukan-surat', async (req, res) => {
    const d = req.body;
    try {
        const [dataWarga] = await pool.query("SELECT * FROM warga WHERE nik = ?", [d.nik]);
        if (dataWarga.length === 0) return res.status(404).json({ error: "Data warga tidak ditemukan." });

        const w = dataWarga[0]; 
        const [resMax] = await pool.query('SELECT MAX(nomor_urut) as m FROM surat WHERE YEAR(tanggal_surat) = YEAR(?)', [d.tanggal]);
        const nextNo = (resMax[0].m || 0) + 1;

        const sql = `INSERT INTO surat (
            nomor_urut, jenis_surat, nama_pemohon, nik_pemohon, tempat_lahir, tanggal_lahir, jenis_kelamin, 
            alamat, agama, status_perkawinan, pekerjaan, nama_usaha, tanggal_surat, status, tujuan, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0)`;

        const values = [
            nextNo, d.jenis_surat, w.nama, w.nik, w.tempat_lahir, w.tanggal_lahir, w.jenis_kelamin, 
            w.alamat, w.agama, w.status_perkawinan, w.pekerjaan, d.nama_usaha || '', d.tanggal, d.tujuan
        ];

        await pool.query(sql, values);
        
        await logActivity("Sistem", 'PENGAJUAN SURAT', `Warga bernama ${w.nama} mengajukan surat secara online`);
        
        res.json({ message: "Berhasil mengajukan surat lengkap!" });
    } catch (err) {
        console.error("Error Detail:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/warga/status/:nik', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT jenis_surat, tanggal_surat as tanggal, status, tujuan FROM surat WHERE nik_pemohon = ? AND is_deleted = 0 ORDER BY id DESC`, [req.params.nik]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/surat/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE surat SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
        await logActivity(req.user.name, 'UPDATE STATUS', `Mengubah status Surat ID ${req.params.id} menjadi ${req.body.status.toUpperCase()}`);
        res.json({ message: "Status OK" });
    } catch (err) {
        console.error("Error Setuju:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/surat/:id/edit', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        const sql = `UPDATE surat SET nama_pemohon=?, nik_pemohon=?, jenis_surat=?, nama_usaha=?, tanggal_surat=?, alamat=?, nomor_urut=? WHERE id=?`;
        const values = [d.nama, d.nik, d.jenis_surat, d.nama_usaha, d.tanggal, d.alamat, d.nomor_urut, req.params.id];
        await pool.query(sql, values);
        
        await logActivity(req.user.name, 'EDIT SURAT', `Mengedit data pada Surat ID ${req.params.id}`);
        res.json({ message: "Data surat diupdate" });
    } catch (err) {
        console.error("Error SQL Edit:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/surat/:id', authenticateToken, async (req, res) => {
    try {
        if (req.query.permanent === 'true') {
            await pool.query("DELETE FROM surat WHERE id=?", [req.params.id]);
            await logActivity(req.user.name, 'HAPUS PERMANEN', `Menghapus permanen Surat ID ${req.params.id}`);
        } else {
            await pool.query("UPDATE surat SET is_deleted=1 WHERE id=?", [req.params.id]);
            await logActivity(req.user.name, 'HAPUS SURAT', `Memindahkan Surat ID ${req.params.id} ke tempat sampah`);
        }
        res.json({ msg: "Ok" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/surat/:id/restore', authenticateToken, async (req, res) => {
    try { 
        await pool.query("UPDATE surat SET is_deleted=0 WHERE id=?", [req.params.id]); 
        await logActivity(req.user.name, 'RESTORE SURAT', `Memulihkan Surat ID ${req.params.id} dari tempat sampah`);
        res.json({ msg: "Ok" }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= 5. API STATS =================
app.get('/api/stats', async (req, res) => {
    try {
        const [warga] = await pool.query("SELECT COUNT(*) as c FROM warga WHERE is_deleted=0");
        const [surat] = await pool.query("SELECT COUNT(*) as c FROM surat WHERE is_deleted=0 AND MONTH(tanggal_surat) = MONTH(CURRENT_DATE()) AND YEAR(tanggal_surat) = YEAR(CURRENT_DATE())");
        const [pending] = await pool.query("SELECT COUNT(*) as c FROM surat WHERE is_deleted=0 AND (status='pending' OR status='draft')");

        const [grafik] = await pool.query(`
            SELECT DATE_FORMAT(tanggal_surat, '%b') as bulan, COUNT(*) as jumlah 
            FROM surat 
            WHERE is_deleted = 0 
            GROUP BY YEAR(tanggal_surat), MONTH(tanggal_surat) 
            ORDER BY tanggal_surat ASC 
            LIMIT 6
        `);

        res.json({
            totalWarga: warga[0].c,
            suratBulanIni: surat[0].c,
            pending: pending[0].c,
            chartData: grafik.length > 0 ? grafik : []
        });
    } catch (err) {
        console.error("Error Stats:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/logs', authenticateToken, async (req, res) => {
    try { const [rows] = await pool.query("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100"); res.json(rows); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Endpoint Publik untuk Cek NIK Warga (Tanpa Token)
app.get('/api/cek-warga/:nik', async (req, res) => {
    try {
        // PERUBAHAN: Ubah "SELECT nik, nama" menjadi "SELECT *" agar semua data warga terambil
        const [rows] = await pool.query("SELECT * FROM warga WHERE nik = ? AND is_deleted = 0", [req.params.nik]);
        if (rows.length > 0) { res.json({ valid: true, data: rows[0] }); } 
        else { res.json({ valid: false }); }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= 6. API MANAJEMEN AKUN (USERS) - SUDAH BCRYPT =================

// Ambil semua daftar akun
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, nama_lengkap, role FROM users ORDER BY role ASC, nama_lengkap ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Buat akun baru (Hash Password sebelum simpan)
app.post('/api/users', authenticateToken, async (req, res) => {
    const d = req.body;
    try {
        const [cekUser] = await pool.query('SELECT id FROM users WHERE username = ?', [d.username]);
        if (cekUser.length > 0) return res.status(400).json({ error: "Username sudah terpakai, pilih yang lain." });

        // Proses hashing (menggiling) password
        const hashedPassword = await bcrypt.hash(d.password, 10);

        const sql = `INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)`;
        // Simpan hasil gilingan (hashedPassword), BUKAN teks aslinya
        await pool.query(sql, [d.username, hashedPassword, d.nama_lengkap, d.role]);
        
        await logActivity(req.user.name, 'TAMBAH AKUN', `Membuat akun baru untuk: ${d.nama_lengkap} (${d.role})`);
        res.json({ message: "Akun berhasil dibuat" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Hapus akun
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const [targetUser] = await pool.query('SELECT username, nama_lengkap FROM users WHERE id = ?', [req.params.id]);
        if (targetUser.length > 0 && targetUser[0].username === req.user.username) {
            return res.status(400).json({ error: "Tidak bisa menghapus akun yang sedang Anda gunakan!" });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        await logActivity(req.user.name, 'HAPUS AKUN', `Menghapus akun milik: ${targetUser[0].nama_lengkap}`);
        res.json({ message: "Akun dihapus" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reset Password Akun (Hash Password baru sebelum update)
app.put('/api/users/:id/reset', authenticateToken, async (req, res) => {
    const { password } = req.body;
    try {
        const [targetUser] = await pool.query('SELECT nama_lengkap FROM users WHERE id = ?', [req.params.id]);
        if (targetUser.length === 0) return res.status(404).json({ error: "Akun tidak ditemukan." });

        // Proses hashing (menggiling) password baru
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update dengan password yang sudah digiling
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
        
        await logActivity(req.user.name, 'RESET PASSWORD', `Mereset password milik akun: ${targetUser[0].nama_lengkap}`);
        
        res.json({ message: "Password berhasil diubah" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server Backend MySQL Berjalan di Port ${PORT}`);
});