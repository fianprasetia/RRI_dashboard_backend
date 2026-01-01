const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectNatura = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;

        const selectNaturaData = await selectNatura()
        if (selectNaturaData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectNaturaData);

        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }

        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        async function selectNatura() {
            return await model.hrd_natura.findAll({
                attributes: ["code_company", "catu_code"],
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                    },
                    {
                        model: model.hrd_catu,
                        attributes: ["catu_code"],
                        include:
                        {
                            model: model.hrd_catu_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                ],
                order: [
                    ["catu_code", "ASC"],
                    ["code_company", "ASC"],
                ]
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectNaturaByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            company_POST: company,
            type_POST: type,
        } = requestData;

        const selectNaturaByCodeData = await selectNaturaByCode()
        if (selectNaturaByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectNaturaByCodeData);
        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }

        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }

        async function selectNaturaByCode() {
            return await model.hrd_natura.findAll({
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                    },
                    {
                        model: model.hrd_catu,
                        attributes: ["catu_code"],
                        include:
                        {
                            model: model.hrd_catu_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_company: company
                        },
                        {
                            catu_code: type
                        },
                    ]
                },
            });
        }
        async function selectEmployee(selectBasicSalaryByCodeData) {
            // const results = [];
            const excludedIds = selectBasicSalaryByCodeData.map(e => e.employee_id);
            var result = await model.hrd_employee.findAll({
                attributes: ["code_company", "worksite", "fullname", "employee_type_code", "employee_id", "id_job_title"],
                include: [
                    {
                        model: model.hrd_job_title,
                        attributes: ["id_job_title"],
                        include:
                        {
                            model: model.hrd_job_title_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                    {
                        model: model.hrd_employee_type,
                        attributes: ["employee_type_code"],
                        include:
                        {
                            model: model.hrd_employee_type_translations,
                            attributes: ["language_code", "translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                ],
                where:
                {
                    [Op.and]: [
                        {
                            employee_id: {
                                [Op.notIn]: excludedIds
                            }
                        },
                        {
                            employee_type_code: type
                        },
                        {
                            worksite: { [Op.like]: `${location}%` }
                        },
                        {
                            date_of_exit: null
                        },
                    ]

                },
                order: [
                    ["fullname", "ASC"]
                ],
            });
            results.push(...result);
            const merged = [
                ...results.map(r => ({
                    code_company: r.worksite,
                    fullname: r.fullname,
                    employee_type_code: r.employee_type_code,
                    employee_id: r.employee_id,
                    id_job_title: r.id_job_title,
                    job_title: r.hrd_job_title?.hrd_job_title_translations?.[0]?.translation || null,
                    employee_type: r.hrd_employee_type?.hrd_employee_type_translations?.[0]?.translation || null,
                    nominal: 0 // default null kalau belum ada gaji
                })),
                ...selectBasicSalaryByCodeData.map(s => ({
                    code_company: s.code_company,
                    fullname: s.hrd_employee?.fullname || null,
                    employee_type_code: s.employee_type_code,
                    employee_id: s.employee_id,
                    id_job_title: s.id_job_title,
                    job_title: s.hrd_job_title?.hrd_job_title_translations?.[0]?.translation || null,
                    employee_type: s.hrd_employee_type?.hrd_employee_type_translations?.[0]?.translation || null,
                    nominal: s.nominal // ada nilai gaji
                }))
            ];
            merged.sort((a, b) => {
                if (a.code_company === b.code_company) {
                    return a.fullname.localeCompare(b.fullname);
                }
                // return a.code_company.localeCompare(b.code_company);
                return a.nominal - b.nominal;
            });
            const header = {
                location: selectBasicSalaryByCodeData[0]["code_company"],
                period: selectBasicSalaryByCodeData[0]["period"],
                type: selectBasicSalaryByCodeData[0]["employee_type_code"],
            }
            return { header, merged };
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.insertNatura = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            company_POST: company,
            type_POST: type,
            employee_POST: employee,
            husband_wife_POST: husbandWife,
            first_child_POST: firstChild,
            second_child_POST: secondChild,
            third_child_POST: thirdChild,
            total_kilogram_POST: totalKilogram,
            rice_price_POST: ricePrice,
            rp_day_POST: rpDay
        } = requestData;

        const isDuplicate = await checkDuplicateNatura();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertNaturaData = await insertNatura();
        if (!insertNaturaData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateNatura() {
            const existing = await model.hrd_natura.findOne({
                where: {
                    [Op.and]: [
                        {
                            code_company: company
                        },
                        {
                            catu_code: type
                        },
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertNatura() {
            return await model.hrd_natura.create(
                {
                    code_company: company,
                    catu_code: type,
                    employee: employee,
                    husband_wife: husbandWife,
                    first_child: firstChild,
                    second_child: secondChild,
                    third_child: thirdChild,
                    total_kilogram: totalKilogram,
                    rice_price_kg: ricePrice,
                    rp_day: rpDay,
                },
                {
                    transaction: transaction
                },
            );
        }

        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }

        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }

        function logAction(status) {
            logger.info(`Insert Natura`, {
                "1.username": username,
                "2.module": "insertNatura",
                "3.status": status,
                "4.action": req.body
            });
        }
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
        logAction('failed');
    }


};
controller.updateNatura = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            username_POST: username,
            company_POST: company,
            type_POST: type,
            employee_POST: employee,
            husband_wife_POST: husbandWife,
            first_child_POST: firstChild,
            second_child_POST: secondChild,
            third_child_POST: thirdChild,
            total_kilogram_POST: totalKilogram,
            rice_price_POST: ricePrice,
            rp_day_POST: rpDay
        } = requestData;


        const updateNaturaData = await updateNatura();
        if (!updateNaturaData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function updateNatura() {
            return await model.hrd_natura.update(
                {
                    employee: employee,
                    husband_wife: husbandWife,
                    first_child: firstChild,
                    second_child: secondChild,
                    third_child: thirdChild,
                    total_kilogram: totalKilogram,
                    rice_price_kg: ricePrice,
                    rp_day: rpDay,
                },
                {
                    where: {
                        [Op.and]: [
                            {
                                code_company: company
                            },
                            {
                                catu_code: type
                            },
                        ]
                    },
                    transaction: transaction
                },
            );
        }
        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        function logAction(status) {
            logger.info(`Update Natura`, {
                "1.username": username,
                "2.module": "updateNatura",
                "3.status": status,
                "4.action": req.body
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