const model = require("../models/index");
const messages = require("./message");
const koneksi = require("../config/database");
const extend = require('extend');
const moment = require('moment-timezone');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectAttendanceLog = async function (req, res) {
    const language = req.body.language_POST;
    try {
        let selectAttendanceLogData = await model.hrd_attendace_log.findAll({
            include: {
                model: model.hrd_employee,
                attributes: ["fullname"],
            },
        });

        if (selectAttendanceLogData.length === 0) {
            return res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        const groupedData = groupByDate(selectAttendanceLogData);
        const dataAttendance = [];
        for (const [date, logs] of Object.entries(groupedData)) {
            logs.sort((a, b) => new Date(a.record_time) - new Date(b.record_time));
            const checkIn = logs[0]; // Waktu masuk pertama
            const checkOut = logs[logs.length - 1]; // Waktu pulang terakhir
            const formattedCheckIn = formatDateTime(checkIn.record_time);
            const formattedCheckOut = formatDateTime(checkOut.record_time);
            dataAttendance.push({
                employee_id: checkIn.hrd_employee.fullname,
                record_date: formattedCheckIn.date,
                check_in: formattedCheckIn.time,
                check_out: formattedCheckOut.time,
            });
        }
        res.json({
            access: "success",
            data: dataAttendance,
        });
    } catch (error) {
        res.status(404).json({
            message: error.message || "Error retrieving attendance log.",
        });
    }
};
function groupByDate(records) {
    return records.reduce((acc, curr) => {
        const recordTimeTemp = new Date(curr.record_time);
        const newDate = new Date(recordTimeTemp.getTime() + 7 * 60 * 60 * 1000);
        const day = String(newDate.getUTCDate()).padStart(2, '0');
        const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
        const year = newDate.getUTCFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        if (!acc[formattedDate]) acc[formattedDate] = [];
        acc[formattedDate].push(curr);
        return acc;
    }, {});
}
function formatDateTime(recordTime) {
    const recordTimeTemp = new Date(recordTime);
    const newDate = new Date(recordTimeTemp.getTime() + 7 * 60 * 60 * 1000);

    const day = String(newDate.getUTCDate()).padStart(2, '0');
    const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
    const year = newDate.getUTCFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const hours = String(newDate.getUTCHours()).padStart(2, '0');
    const minutes = String(newDate.getUTCMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return { date: formattedDate, time: formattedTime };
}
controller.insertAttendanceLog = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var recordTime = req.body.attendanceLog_POST
        var username = req.body.username_POST
        jmlData = recordTime[0].length;
        var dataRecordTime = []
        for (var i = 0; i < jmlData; i++) {
            const recordTimeTemp = recordTime[0][i]["recordTime_POST"];
            const momentDate = moment.tz(recordTimeTemp, "DD-MM-YYYY HH:mm", "Asia/Jakarta");
            const timestampWithTZ = momentDate.add(7, 'hours').toISOString();
            const employeeID = JSON.parse('{"employee_id": ' + recordTime[0][i]["employeeID_POST"] + '}')
            const Time = JSON.parse('{"record_time": "' + timestampWithTZ + '"}')
            extend(employeeID, Time);
            dataRecordTime.push(employeeID);
        }
        let insertAttendanceLogData = await model.hrd_attendace_log.bulkCreate(
            dataRecordTime,
            {
                transaction: transaction
            }
        );
        if (insertAttendanceLogData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: insertAttendanceLogData,
            });
            logger.info('Insert Attendance', {
                "1.username": `${username}`,
                "2.module": 'insertAttendanceLog',
                "3.status": 'success',
                "4.action": req.body
            });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;