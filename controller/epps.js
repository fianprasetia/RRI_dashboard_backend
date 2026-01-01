function customRound(number) {
    return Math.floor(number + 0.5);
}
function ddmmyyyy(tanggal) {
    var bagianTanggal = tanggal.split('-');
    var tanggalBaru = bagianTanggal[2] + '-' + bagianTanggal[1] + '-' + bagianTanggal[0];
    return tanggalBaru;
}

function getLastDateOfMonth(yyyyMM) {
    const [year, month] = yyyyMM.split("-").map(Number);
    const lastDate = new Date(year, month, 0); // hari ke-0 dari bulan berikutnya = akhir bulan ini
    return lastDate.toISOString().split("T")[0]; // hasilnya dalam format YYYY-MM-DD
}
function getMonthRange(ym) {
    const [y, m] = ym.split('-').map(Number);

    // tanggal awal selalu hari ke-1
    const start = `${ym}-01`;

    // buat objek Date di hari ke-0 bulan berikutnya  → otomatis hari terakhir bulan ini
    const lastDay = new Date(y, m, 0).getDate();   // m = bulan 1-based di sini
    const end = `${ym}-${String(lastDay).padStart(2, '0')}`;

    return { start, end };
}
module.exports = {
    ddmmyyyy,
    customRound,
    getLastDateOfMonth,
    getMonthRange
};