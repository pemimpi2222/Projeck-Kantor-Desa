// backup.js - backup otomatis database
const fs = require('fs');
const path = require('path');

/**
 * Automated database backup
 * Copies the database file to a backup folder with a timestamp
 * menghapus backup yang lebih dari 30 hari
 * @throws {Error} If an error occurs during the backup process
 */
function backupDatabase() {
  try {
    const sourceFile = 'desa_surat.db';
    const backupDir = 'backups';
    
    // Cek jika database exist
    if (!fs.existsSync(sourceFile)) {
      console.log('⚠️  Database tidak ditemukan, skip backup');
      return;
    }
    
    // Buat folder backups jika belum ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Nama file backup dengan tanggal dan waktu
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0] + '_' + 
                      now.getHours().toString().padStart(2, '0') + '-' +
                      now.getMinutes().toString().padStart(2, '0');
    const backupFile = path.join(backupDir, `desa_surat_${timestamp}.db`);
    
    // Copy file
    fs.copyFileSync(sourceFile, backupFile);
    console.log(`✓ Backup berhasil: ${backupFile}`);
    
    // Hapus backup yang lebih dari 30 hari
    const files = fs.readdirSync(backupDir);
    let deletedCount = 0;
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stat = fs.statSync(filePath);
      const ageInDays = (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️  Hapus ${deletedCount} backup lama (> 30 hari)`);
    }
    
  } catch (e) {
    console.error('❌ Backup error:', e.message);
  }
}

// Jalankan backup pertama kali saat server start
backupDatabase();

// Setup schedule - jalankan setiap 6 jam
let scheduleLoaded = false;
try {
  const schedule = require('node-schedule');
  // Backup jam 00:00, 06:00, 12:00, 18:00
  schedule.scheduleJob('0 0,6,12,18 * * *', backupDatabase);
  console.log('✓ Backup scheduler aktif (setiap 6 jam)');
  scheduleLoaded = true;
} catch (e) {
  console.log('⚠️  node-schedule tidak terinstall - backup otomatis disabled');
  console.log('   Install dengan: npm install node-schedule');
  console.log('   Backup manual tetap berjalan saat server start');
}

module.exports = { backupDatabase };
