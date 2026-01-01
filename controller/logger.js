// const moment = require('moment-timezone');
// const path = require('path');
// const winston = require('winston');

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp({
//             format: () => moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') // Format waktu WIB
//         }),
//         winston.format.json()
//     ),
//     transports: [
//         new winston.transports.File({ 
//             filename: path.join(__dirname,'../assets/log', 'user_activity.log') 
//          }),
//         new winston.transports.Console()
//     ]
// });

// module.exports = logger;
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const winston = require('winston');

const logFilePath = path.join(__dirname, '../assets/log', 'user_activity.log');

function deleteLogIfOldByLastTimestamp() {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) return; // File tidak ditemukan atau gagal dibaca

        const lines = data.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return;

        const lastLine = lines[lines.length - 1];

        let lastTimestamp;
        try {
            const logEntry = JSON.parse(lastLine);
            lastTimestamp = logEntry.timestamp;
        } catch (err) {
            console.error('Gagal parse baris terakhir sebagai JSON:', err);
            return;
        }

        if (!lastTimestamp) {
            console.warn('Baris terakhir tidak mengandung timestamp.');
            return;
        }

        const logTime = moment.tz(lastTimestamp, 'Asia/Jakarta');
        const now = moment.tz('Asia/Jakarta');
        const monthDiff = now.diff(logTime, 'months');

        if (monthDiff >= 5) {
            fs.unlink(logFilePath, (err) => {
                if (err) console.error('Gagal hapus log:', err);
                else console.log('Log dihapus berdasarkan timestamp terakhir:', logTime.format());
            });
        }
    });
}

// Jalankan sebelum logger dibuat
deleteLogIfOldByLastTimestamp();

// Buat logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') // WIB
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: logFilePath
        }),
        new winston.transports.Console()
    ]
});

module.exports = logger;
