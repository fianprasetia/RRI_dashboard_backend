require('dotenv').config();

const koneksi = require("../config/database");
const messages = require("./message")
const controller = {}
const { Op, json } = require("sequelize")


controller.selectWeight = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const result = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const startMonth = `${result}-01`

        const selectWeightDayAllData = await selectWeightDayAll()

        const selectWeightDayIntiData = await selectWeightDayInti()

        const selectWeightDayPlasmaData = await selectWeightDayPlasma()

        const selectWeightDayExternalData = await selectWeightDayExternal()

        const selectWeightMonthAllData = await selectWeightMonthAll()

        const selectWeightMonthIntiData = await selectWeightMonthInti()

        const selectWeightMonthPlasmaData = await selectWeightMonthPlasma()

        const selectWeightMonthExternalData = await selectWeightMonthExternal()

        var data = {
            dataDayAll: selectWeightDayAllData,
            dataDayInti: selectWeightDayIntiData,
            dataDayPlasma: selectWeightDayPlasmaData,
            dataDayExternal: selectWeightDayExternalData,
            dataMonthAll: selectWeightMonthAllData,
            dataMonthInti: selectWeightMonthIntiData,
            dataMonthPlasma: selectWeightMonthPlasmaData,
            dataMonthExternal: selectWeightMonthExternalData,
        }
        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectWeightDayAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal LIKE '${today}%' AND kodebarang='400000003' AND millcode='BAFM'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND millcode='BAFM' AND tanggal LIKE '${today}%'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND millcode='BAFM' AND tanggal LIKE '${today}%'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND millcode='BAFM' AND tanggal LIKE '${today}%'
            `);
            return rowsExternal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59' AND millcode='BAFM' AND kodebarang='400000003'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND millcode='BAFM' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND millcode='BAFM' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND millcode='BAFM' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
            `);
            return rowsExternal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        function sendSuccessResponse(message, data = []) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                // message: message,
                data: data
            });
        }
        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: []
            });
        } else {
            res.status(404).json({
                message: error.message
            });
        }
    }
}
controller.selectWeightDetail = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const result = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const startMonth = `${result}-01`


        const selectWeightMonthSupllierData = await selectWeightMonthSupllier()
        const selectWeightMonthIntiData = await selectWeightMonthInti()

        const combinedData = [
            ...selectWeightMonthIntiData.map(d => ({
                nama: d.namaorganisasi,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightMonthSupllierData.map(d => ({
                nama: d.namasupplier,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            }))
        ];
        combinedData.sort((a, b) => {
            if (a.tanggal === b.tanggal) {
                return a.nama.localeCompare(b.nama); // optional
            }
            return new Date(b.tanggal) - new Date(a.tanggal);
        });


        sendSuccessResponse(messages[language]?.accessSuccess, combinedData);

        async function selectWeightMonthSupllier() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59' AND millcode='BAFM' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
            `);
            return rowsSupplier
        }
        async function selectWeightMonthInti() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namaorganisasi, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN organisasi ON pabrik_timbangan.kodeorg = organisasi.kodeorganisasi 
            WHERE intex = 1 AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59' AND millcode='BAFM' AND kodebarang='400000003'
            GROUP BY kodeorg, DATE(tanggal)
            ORDER BY tanggal DESC, kodeorg
            `);
            return rowsSupplier
        }

        function sendSuccessResponse(message, data = []) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                // message: message,
                data: data
            });
        }
        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: []
            });
        } else {
            res.status(404).json({
                message: error.message
            });
        }
    }
}
module.exports = controller;