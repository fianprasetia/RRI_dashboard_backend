const model = require("../models/index");
const moment = require('moment');
const messages = require("./message");
const koneksi = require("../config/database");
const controller = {}
const { Op, json } = require("sequelize")

controller.selectAssignEmployeeReport = async function (req, res) {
    var language = req.body.language_POST
    companyCode = req.body.companyCode_POST
    employeeCode = req.body.employeeCode_POST
    startDateTemp = req.body.startDate_POST
    startDate = new Date(startDateTemp + "T00:00:00")
    endDateTemp = req.body.endDate_POST
    endDate = new Date(endDateTemp + "T23:59:59")

    if (employeeCode == "all") {
        attendance = {
            code_company: companyCode
        }
    } else {
        attendance =
        {
            [Op.and]: [
                {
                    code_company: companyCode,
                    employee_id: employeeCode
                },
            ]
        }
    }
    try {
        let selectAssignEmployeeReportData = await model.hrd_employee_assign.findAll({
            include: [
                {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                },
                {
                    model: model.adm_company,
                    attributes: ["name"],
                },
                {
                    model: model.hrd_working_hours, as: "MondayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "TuesdayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "WednesdayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "ThursdayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "FridayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SaturdayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
                {
                    model: model.hrd_working_hours, as: "SundayHours",
                    // attributes: ["id_working_hours","on_duty_time","off_duty_time"],
                    include:
                    {
                        model: model.hrd_working_hours_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                },
            ],
            where: attendance
        });
        if (selectAssignEmployeeReportData.length > 0) {
            await selectAttendanceLog(selectAssignEmployeeReportData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectAttendanceLog(selectAssignEmployeeReportData) {
            var arrIdEmployee = [];
            for (var i = 0; i < selectAssignEmployeeReportData.length; i++)
                arrIdEmployee.push(selectAssignEmployeeReportData[i]["employee_id"]);
            let selectAttendanceLogData = await model.hrd_attendace_log.findAll({
                include: {
                    model: model.hrd_employee,
                    attributes: ["fullname"],
                },
                where: {
                    [Op.and]: [

                        { employee_id: arrIdEmployee },
                        {
                            record_time: {
                                [Op.between]: [startDate, endDate]
                            },
                        }

                    ]
                }
            });
            let current = moment(startDate);
            const end = moment(endDate);
            const allDates = [];
        
            // Mengisi semua tanggal dalam rentang
            while (current <= end) {
                allDates.push(current.format('YYYY-MM-DD'));
                current.add(1, 'day');
            }
            
            const logsByEmployee = {};
            selectAttendanceLogData.forEach((log) => {
                const date = moment(log.record_time).format('YYYY-MM-DD'); // Format tanggal tanpa jam
                const employeeId = log.employee_id;
            
                if (!logsByEmployee[employeeId]) logsByEmployee[employeeId] = {};
                if (!logsByEmployee[employeeId][date]) logsByEmployee[employeeId][date] = [];
            
                logsByEmployee[employeeId][date].push(log);
            });
            
            const result = [];
            for (const employee of selectAssignEmployeeReportData) {
                const employeeId = employee.employee_id;
        
                // Periksa setiap tanggal dalam rentang
                allDates.forEach((date) => {
                    let checkInTime, checkOutTime;
                    const records = logsByEmployee[employeeId]?.[date] || [];
        
                    if (records.length > 0) {
                        // Urutkan berdasarkan record_time
                        records.sort((a, b) => new Date(a.record_time) - new Date(b.record_time));
        
                        const checkIn = records[0]; // Waktu masuk pertama
                        const checkOut = records[records.length - 1]; // Waktu keluar terakhir
        
                        checkInTime = moment(checkIn.record_time);
                        checkOutTime = moment(checkOut.record_time);
        
                        // Jika shift malam (check_in malam, check_out pagi keesokan harinya)
                        if (checkOutTime.isBefore(checkInTime)) {
                            // Tambahkan 1 hari ke checkOut untuk shift malam
                            checkOutTime.add(1, 'day');
                        }
                    }
        
                    result.push({
                        employee_id: employeeId,
                        fullname: employee.hrd_employee.fullname,
                        date: date,
                        check_in: checkInTime ? checkInTime.format('HH:mm:ss') : "", // Format jam masuk atau kosong
                        check_out: checkOutTime ? checkOutTime.format('HH:mm:ss') : "" // Format jam pulang atau kosong
                    });
                });
            }



            var data = {
                dataAssignEmployee: selectAssignEmployeeReportData,
                dataAttendanceLog: result,
            }
            if (selectAttendanceLogData.length > 0) {
                res.json({
                    access: "success",
                    data: data,
                });
            } else {
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }





    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;