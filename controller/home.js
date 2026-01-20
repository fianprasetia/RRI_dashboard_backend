require('dotenv').config();

const koneksi = require("../config/database");
const messages = require("./message")
const controller = {}
const { Op, json } = require("sequelize")


controller.selectWeightDaily = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            date_POST: date
        } = requestData;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const result = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const startMonth = `${result}-01`

        const selectWeightDayAllData = await selectWeightDayAll()
        const selectWeightDayIntiData = await selectWeightDayInti()
        const selectWeightDayPlasmaData = await selectWeightDayPlasma()
        const selectWeightDayExternalData = await selectWeightDayExternal()

        var data = {
            dataDayAll: selectWeightDayAllData,
            dataDayInti: selectWeightDayIntiData,
            dataDayPlasma: selectWeightDayPlasmaData,
            dataDayExternal: selectWeightDayExternalData,
        }
        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectWeightDayAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal LIKE '${date}%' AND kodebarang='400000003'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND tanggal LIKE '${date}%'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND tanggal LIKE '${date}%'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightDayExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND tanggal LIKE '${date}%'
            `);
            return rowsExternal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59' AND kodebarang='400000003'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND  tanggal BETWEEN '${startMonth} 00:00:00' AND '${today} 23:59:59'
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
controller.selectWeightWeekly = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_date_POST:startDate,
            end_date_POST:endDate
        } = requestData;

        // const today = new Date().toISOString().split('T')[0];
        // const now = new Date();
        // const sevenDaysAgo = new Date(now);
        // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        // const startDate = sevenDaysAgo.toISOString().split('T')[0];
        const selectWeightWeeklyIntiData = await selectWeightWeeklyInti();
        const selectWeightweeklySupplierData = await selectWeightweeklySupplier();
        const selectWeightWeeklyExternalData = await selectWeightWeeklyExternal();
        const selectWeightWeeklyTotalData = await selectWeightWeeklyTotal();

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

        // const combinedData = Object.values(
        //     [
        //         ...selectWeightWeeklyIntiData.map(d => ({
        //             tanggal: d.tanggal,
        //             inti: d.total_berat_bersih,
        //             supplier: 0,
        //             external: 0,
        //             total: 0
        //         })),
        //         ...selectWeightweeklySupplierData.map(d => ({
        //             tanggal: d.tanggal,
        //             inti: 0,
        //             supplier: d.total_berat_bersih,
        //             external: 0,
        //             total: 0
        //         })),
        //         ...selectWeightWeeklyExternalData.map(d => ({
        //             tanggal: d.tanggal,
        //             inti: 0,
        //             supplier: 0,
        //             external: d.total_berat_bersih,
        //             total: 0
        //         })),
        //         ...selectWeightWeeklyTotalData.map(d => ({
        //             tanggal: d.tanggal,
        //             inti: 0,
        //             supplier: 0,
        //             external: 0,
        //             total: d.total_berat_bersih
        //         }))
        //     ].reduce((acc, cur) => {
        //         if (!acc[cur.tanggal]) {
        //             acc[cur.tanggal] = {
        //                 tanggal: cur.tanggal,
        //                 inti: 0,
        //                 supplier: 0,
        //                 external: 0,
        //                 total: 0
        //             };
        //         }

        //         acc[cur.tanggal].inti += cur.inti;
        //         acc[cur.tanggal].supplier += cur.supplier;
        //         acc[cur.tanggal].external += cur.external;
        //         acc[cur.tanggal].total += cur.total;

        //         return acc;
        //     }, {})
        // ).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // terbaru → lama

        sendSuccessResponse(messages[language]?.accessSuccess, combinedData);
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
            WHERE intex = 0 AND nospb LIKE '50%' AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'  AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyExternal() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'  AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            `);
            return rowsSupplier
        }
        async function selectWeightWeeklyTotal() {
            const [rowsSupplier] = await koneksi.query(`
            SELECT DATE(tanggal) AS tanggal, SUM(beratbersih) AS total_berat_bersih           
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'  AND kodebarang='400000003'
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
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
controller.selectWeightMonthly = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            month_POST:month
        } = requestData;
        const startMonth = `${month}-01`
        const endMonth = `${month}-31`


        const selectWeightMonthAllData = await selectWeightMonthAll()

        const selectWeightMonthIntiData = await selectWeightMonthInti()

        const selectWeightMonthPlasmaData = await selectWeightMonthPlasma()

        const selectWeightMonthExternalData = await selectWeightMonthExternal()

        var data = {
            dataMonthAll: selectWeightMonthAllData,
            dataMonthInti: selectWeightMonthIntiData,
            dataMonthPlasma: selectWeightMonthPlasmaData,
            dataMonthExternal: selectWeightMonthExternalData,
        }
        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectWeightMonthAll() {
            const [rowsTotal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59' AND kodebarang='400000003'
            `);
            return rowsTotal.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthInti() {
            const [rowsInti] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 1 AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59'
            `);
            return rowsInti.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthPlasma() {
            const [rowsPlasma] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59'
            `);
            return rowsPlasma.map(r => ({
                total_berat: (r.total_berat ?? 0) / 1000
            }));
        }
        async function selectWeightMonthExternal() {
            const [rowsExternal] = await koneksi.query(`
            SELECT SUM(beratbersih) AS total_berat               
            FROM pabrik_timbangan
            WHERE intex = 0 AND nospb LIKE '40%' AND kodebarang='400000003' AND  tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59'
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