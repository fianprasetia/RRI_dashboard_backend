require('dotenv').config();

const koneksi = require("../config/database");
const messages = require("./message")
const controller = {}
const { Op, json } = require("sequelize")


controller.selectLogin = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            password_POST: password,
            username_POST: username,
        } = requestData;

        const selectLoginData = await selectLogin()
        if (selectLoginData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.accessFailed);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.accessSuccess, selectLoginData);

        async function selectLogin() {
            const [rows] = await koneksi.query(`
            SELECT *                
            FROM user
            LEFT JOIN datakaryawan ON user.karyawanid = datakaryawan.karyawanid 
            WHERE namauser = '${username}' AND password = PASSWORD('${password}');
            `);
            return rows;
        }
        function sendSuccessResponse(message, data = []) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
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
        await transaction.rollback();
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