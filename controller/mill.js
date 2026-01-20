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
            mill_POST: mill,
            date_POST: date
        } = requestData;
        const selectWeightDayAllData = await selectWeightDayAll()
        const selectWeightDayIntiData = await selectWeightDayInti()
        const selectWeightDayPlasmaData = await selectWeightDayPlasma()
        const selectWeightDayExternalData = await selectWeightDayExternal()
        const selectWeightDayIntiDetailData = await selectWeightDayIntiDetail()
        const selectWeightDayPlasmaDetailData = await selectWeightDayPlasmaDetail()
        const selectWeightDayExternalDetailData = await selectWeightDayExternalDetail()

        const combinedData = [
            ...selectWeightDayIntiDetailData.map(d => ({
                nama: d.namaorganisasi,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightDayPlasmaDetailData.map(d => ({
                nama: d.namasupplier,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightDayExternalDetailData.map(d => ({
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

        var data = {
            dataDayAll: selectWeightDayAllData,
            dataDayInti: selectWeightDayIntiData,
            dataDayPlasma: selectWeightDayPlasmaData,
            dataDayExternal: selectWeightDayExternalData,
            dataDayDetail: combinedData
        }
        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectWeightDayAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal LIKE '${date}%' AND kodebarang='400000003' AND millcode='${mill}'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND millcode='${mill}' AND tanggal LIKE '${date}%'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND millcode='${mill}' AND tanggal LIKE '${date}%'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND millcode='${mill}' AND tanggal LIKE '${date}%'
            `);
            return rowsExternal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayIntiDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namaorganisasi, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN organisasi ON pabrik_timbangan.kodeorg = organisasi.kodeorganisasi 
            WHERE intex = 1 AND tanggal LIKE '${date}%' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodeorg, DATE(tanggal)
            ORDER BY tanggal DESC, kodeorg
            `);
            return rowsSupplier
        }
        async function selectWeightDayPlasmaDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND tanggal LIKE '${date}%' AND nospb LIKE '50%' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
            `);
            return rowsSupplier
        }
        async function selectWeightDayExternalDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND tanggal LIKE '${date}%' AND nospb LIKE '40%' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
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
controller.selectWeightWeekly = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            mill_POST: mill,
            start_date_POST: startDate,
            end_date_POST: endDate
        } = requestData;
        const selectWeightWeeklyIntiData = await selectWeightWeeklyInti();
        const selectWeightweeklySupplierData = await selectWeightweeklySupplier();
        const selectWeightWeeklyExternalData = await selectWeightWeeklyExternal();
        const selectWeightWeeklyTotalData = await selectWeightWeeklyTotal();
        const selectWeightWeeklyIntiDetailData = await selectWeightWeeklyIntiDetail();
        const selectWeightWeeklyPlasmaDetailData = await selectWeightWeeklyPlasmaDetail();
        const selectWeightWeeklyExternalDetailData = await selectWeightWeeklyExternalDetail();
        const mergedData = Object.values(
            [
                ...selectWeightWeeklyIntiData.map(d => ({
                    tanggal: d.tanggal,
                    inti: d.total_berat_bersih,
                    supplier: 0,
                    external: 0,
                    total: 0
                })),
                ...selectWeightweeklySupplierData.map(d => ({
                    tanggal: d.tanggal,
                    inti: 0,
                    supplier: d.total_berat_bersih,
                    external: 0,
                    total: 0
                })),
                ...selectWeightWeeklyExternalData.map(d => ({
                    tanggal: d.tanggal,
                    inti: 0,
                    supplier: 0,
                    external: d.total_berat_bersih,
                    total: 0
                })),
                ...selectWeightWeeklyTotalData.map(d => ({
                    tanggal: d.tanggal,
                    inti: 0,
                    supplier: 0,
                    external: 0,
                    total: d.total_berat_bersih
                }))
            ].reduce((acc, cur) => {
                if (!acc[cur.tanggal]) {
                    acc[cur.tanggal] = {
                        tanggal: cur.tanggal,
                        inti: 0,
                        supplier: 0,
                        external: 0,
                        total: 0
                    };
                }

                acc[cur.tanggal].inti += cur.inti;
                acc[cur.tanggal].supplier += cur.supplier;
                acc[cur.tanggal].external += cur.external;
                acc[cur.tanggal].total += cur.total;

                return acc;
            }, {})
        );

        if (!mergedData.find(d => d.tanggal === endDate)) {
            mergedData.push({
                tanggal: endDate,
                inti: 0,
                supplier: 0,
                external: 0,
                total: 0
            });
        }
        const combinedData = mergedData.sort(
            (a, b) => b.tanggal.localeCompare(a.tanggal)
        );

        const combinedDataDetail = [
            ...selectWeightWeeklyIntiDetailData.map(d => ({
                nama: d.namaorganisasi,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightWeeklyPlasmaDetailData.map(d => ({
                nama: d.namasupplier,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightWeeklyExternalDetailData.map(d => ({
                nama: d.namasupplier,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            }))
        ];
        combinedDataDetail.sort((a, b) => {
            if (a.tanggal === b.tanggal) {
                return a.nama.localeCompare(b.nama); // optional
            }
            return new Date(b.tanggal) - new Date(a.tanggal);
        });


        var data = {
            datacombinedData: combinedData,
            datacombinedDataDetail: combinedDataDetail,
        }
        sendSuccessResponse(messages[language]?.accessSuccess, data);
        async function selectWeightWeeklyInti() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE intex = 1 AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'  AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightweeklySupplier() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyExternal() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyTotal() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyIntiDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namaorganisasi, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN organisasi ON pabrik_timbangan.kodeorg = organisasi.kodeorganisasi 
            WHERE intex = 1 AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodeorg, DATE(tanggal)
            ORDER BY tanggal DESC, kodeorg
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyPlasmaDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND nospb LIKE '50%' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyExternalDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' AND nospb LIKE '40%' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
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
controller.selectWeightmonthly = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            mill_POST: mill,
            month_POST: month
        } = requestData;
        const startMonth = `${month}-01`
        const endMonth = `${month}-31`

        const selectWeightMonthSupllierDetailData = await selectWeightMonthSupllierDetail()
        const selectWeightMonthIntiDetailDetail = await selectWeightMonthIntiDetail()
        const selectWeightMonthExternalDetailData = await selectWeightMonthExternalDetail()
        const selectWeightMonthAllData = await selectWeightMonthAll()
        const selectWeightMonthIntiData = await selectWeightMonthInti()
        const selectWeightMonthSupllierData = await selectWeightMonthSupllier()
        const selectWeightMonthlyExternalData = await selectWeightMonthlyExternal()


        const combinedData = [
            ...selectWeightMonthIntiDetailDetail.map(d => ({
                nama: d.namaorganisasi,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightMonthSupllierDetailData.map(d => ({
                nama: d.namasupplier,
                tanggal: d.tanggal,
                total_berat_bersih: d.total_berat_bersih
            })),
            ...selectWeightMonthExternalDetailData.map(d => ({
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
        var data = {
            dataMonthAll: selectWeightMonthAllData,
            dataMonthInti: selectWeightMonthIntiData,
            dataMonthPlasma: selectWeightMonthSupllierData,
            dataMonthExternal: selectWeightMonthlyExternalData,
            dataMonthDetail: combinedData
        }

        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectWeightMonthSupllierDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND nospb LIKE '40%'AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
            `);
            return rowsSupplier
        }
        async function selectWeightMonthIntiDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namaorganisasi, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN organisasi ON pabrik_timbangan.kodeorg = organisasi.kodeorganisasi 
            WHERE intex = 1 AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodeorg, DATE(tanggal)
            ORDER BY tanggal DESC, kodeorg
            `);
            return rowsSupplier
        }
        async function selectWeightMonthExternalDetail() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT namasupplier, DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih            
            FROM pabrik_timbangan
            LEFT JOIN log_5supplier ON pabrik_timbangan.kodesupplier = log_5supplier.supplierid 
            WHERE intex = 0 AND nospb LIKE '50%' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' AND millcode='${mill}' AND kodebarang='400000003'
            GROUP BY kodesupplier, DATE(tanggal)
            ORDER BY tanggal DESC, kodesupplier
            `);
            return rowsSupplier
        }
        async function selectWeightMonthAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' AND kodebarang='400000003' AND millcode='${mill}'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND millcode='${mill}' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' 
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthSupllier() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND millcode='${mill}' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' 
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthlyExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND millcode='${mill}' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' 
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
module.exports = controller;