require('dotenv').config();

const koneksi = require("../config/database");
const messages = require("./message")
const controller = {}
const { Op, json } = require("sequelize")


controller.selectProductivitiesReport1 = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_month_POST: startMonth,
            end_month_POST: endMonth,
        } = requestData;


        const selectTBSIntiEastData = await selectTBSIntiEast()
        const selectTBSIntiWestData = await selectTBSIntiWest()
        const selectTBSIntiSemeData = await selectTBSIntiSeme()
        const selectTBSPlasmaData = await selectTBSPlasma()
        const selectTBSExternalData = await selectTBSExternal()
        const selectTBSProsesData = await selectTBSProses()
        const selectCPOProductionData = await selectCPOProduction()
        const selectDispatchCPOData = await selectDispatchCPO()
        const selectPKProductionData = await selectPKProduction()
        const selectPKDispatchData = await selectPKDispatch()

        var data = {
            dataTBSEast: selectTBSIntiEastData,
            dataTBSWest: selectTBSIntiWestData,
            dataTBSSeme: selectTBSIntiSemeData,
            dataTBSPlasma: selectTBSPlasmaData,
            dataTBSExternal: selectTBSExternalData,
            dataTBSProses: selectTBSProsesData,
            dataCPOProduction: selectCPOProductionData,
            dataDispatchCPO: selectDispatchCPOData,
            dataPKProduction: selectPKProductionData,
            dataPKDispatch: selectPKDispatchData
        }

        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectTBSIntiEast() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'ESEE' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSIntiWest() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'WSEE' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSIntiSeme() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'SEME' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSPlasma() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
             WHERE nospb LIKE '5%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSExternal() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
             WHERE nospb LIKE '4%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSProses() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 1 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 2 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 3 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 4 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 5 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 6 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(tbsdiolahnetto) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
        async function selectCPOProduction() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 1 THEN oer ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 2 THEN oer ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 3 THEN oer ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 4 THEN oer ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 5 THEN oer ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 6 THEN oer ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(oer) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
        async function selectDispatchCPO() {
            const [rowsTotal] = await koneksi.query(`
           SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE wbcond = 'Normal' AND kodebarang = '400000001' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';`);
            return rowsTotal
        }
     async function selectPKProduction() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 1 THEN oerpk ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 2 THEN oerpk ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 3 THEN oerpk ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 4 THEN oerpk ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 5 THEN oerpk ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 6 THEN oerpk ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(oerpk) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
    async function selectPKDispatch() {
            const [rowsTotal] = await koneksi.query(`
           SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 1 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 2 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 3 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 4 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 5 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 6 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE wbcond = 'Normal' AND kodebarang = '400000002' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';`);
            return rowsTotal
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
controller.selectProductivitiesReport2 = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_month_POST: startMonth,
            end_month_POST: endMonth,
        } = requestData;


        const selectTBSIntiEastData = await selectTBSIntiEast()
        const selectTBSIntiWestData = await selectTBSIntiWest()
        const selectTBSIntiSemeData = await selectTBSIntiSeme()
        const selectTBSPlasmaData = await selectTBSPlasma()
        const selectTBSExternalData = await selectTBSExternal()
        const selectTBSProsesData = await selectTBSProses()
        const selectCPOProductionData = await selectCPOProduction()
        const selectDispatchCPOData = await selectDispatchCPO()
        const selectPKProductionData = await selectPKProduction()
        const selectPKDispatchData = await selectPKDispatch()

        var data = {
            dataTBSEast: selectTBSIntiEastData,
            dataTBSWest: selectTBSIntiWestData,
            dataTBSSeme: selectTBSIntiSemeData,
            dataTBSPlasma: selectTBSPlasmaData,
            dataTBSExternal: selectTBSExternalData,
            dataTBSProses: selectTBSProsesData,
            dataCPOProduction: selectCPOProductionData,
            dataDispatchCPO: selectDispatchCPOData,
            dataPKProduction: selectPKProductionData,
            dataPKDispatch: selectPKDispatchData
        }

        sendSuccessResponse(messages[language]?.accessSuccess, data);

        async function selectTBSIntiEast() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'ESEE' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSIntiWest() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'WSEE' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSIntiSeme() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE kodeorg = 'SEME' AND kodebarang = '400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSPlasma() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
             WHERE intex = 0 AND nospb LIKE '50%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSExternal() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal)=7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal)=12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
             WHERE intex = 0 AND nospb LIKE '4%' AND kodebarang='400000003' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';
            `);
            return rowsTotal
        }
        async function selectTBSProses() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 7 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 8 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 9 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 10 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 11 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 12 THEN tbsdiolahnetto ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(tbsdiolahnetto) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
        async function selectCPOProduction() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 7 THEN oer ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 8 THEN oer ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 9 THEN oer ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 10 THEN oer ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 11 THEN oer ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 12 THEN oer ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(oer) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
        async function selectDispatchCPO() {
            const [rowsTotal] = await koneksi.query(`
           SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE wbcond = 'Normal' AND kodebarang = '400000001' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';`);
            return rowsTotal
        }
     async function selectPKProduction() {
            const [rowsTotal] = await koneksi.query(`
            SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 7 THEN oerpk ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 8 THEN oerpk ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 9 THEN oerpk ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 10 THEN oerpk ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 11 THEN oerpk ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 12 THEN oerpk ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(oerpk) / 1000, 2) AS Total
            FROM pabrik_produksi
            WHERE tanggal BETWEEN '${startMonth}' AND '${endMonth}';
            `);
            return rowsTotal
        }
    async function selectPKDispatch() {
            const [rowsTotal] = await koneksi.query(`
           SELECT
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 7 THEN beratbersih ELSE 0 END) / 1000, 2) AS a,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 8 THEN beratbersih ELSE 0 END) / 1000, 2) AS b,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 9 THEN beratbersih ELSE 0 END) / 1000, 2) AS c,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 10 THEN beratbersih ELSE 0 END) / 1000, 2) AS d,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 11 THEN beratbersih ELSE 0 END) / 1000, 2) AS e,
                ROUND(SUM(CASE WHEN MONTH(tanggal) = 12 THEN beratbersih ELSE 0 END) / 1000, 2) AS f,
                ROUND(SUM(beratbersih) / 1000, 2) AS Total
            FROM pabrik_timbangan
            WHERE wbcond = 'Normal' AND kodebarang = '400000002' AND tanggal BETWEEN '${startMonth} 00:00:00' AND '${endMonth} 23:59:59';`);
            return rowsTotal
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