const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectBasicSalary = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            company_type_POST: companyType,
            parent_code_POST: parentCode
        } = requestData;

        const selectEstateData = await selectEstate()
        if (selectEstateData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        const selectBasicSalaryData = await selectBasicSalary(selectEstateData)
        if (!selectBasicSalaryData) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectBasicSalaryData);

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
        async function selectEstate() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    [Op.and]: [
                        {
                            code_company_type: companyType
                        },
                        {
                            parent_code: parentCode
                        }
                    ]

                },
                order: ["name"]
            });
        }
        async function selectBasicSalary(selectEstateData) {
            const includsCompany = selectEstateData.map(e => e.code_company);
            const data = await model.hrd_basic_salary.findAll({
                attributes: [
                    [sequelize.fn('DISTINCT', sequelize.col('hrd_basic_salary.code_company')), 'code_company'],
                    'period',
                    'employee_type_code'
                ],
                include: [
                    {
                        model: model.hrd_employee_type,
                        attributes: ["employee_type_code"],
                        include:
                        {
                            model: model.hrd_employee_type_translations,
                            attributes: ["translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                    {
                        model: model.adm_company,
                        attributes: ["name"],
                    },
                ],
                raw: true,
                where: {
                    code_company: includsCompany
                },
                order: [
                    ['period', 'DESC'],
                    ['code_company', 'ASC'],
                ],
            });
            return data;
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
}
controller.selectBasicSalaryByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            period_POST: period,
            location_POST: location,
            type_POST: type,
        } = requestData;

        const selectBasicSalaryByCodeData = await selectBasicSalaryByCode()
        if (selectBasicSalaryByCodeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }
        const selectEmployeeData = await selectEmployee(selectBasicSalaryByCodeData)
        if (selectEmployeeData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectEmployeeData);
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

        async function selectBasicSalaryByCode() {
            return await model.hrd_basic_salary.findAll({
                attributes: ["code_company", "employee_type_code", "employee_id", "nominal", "id_job_title", "period"],
                include: [
                    {
                        model: model.hrd_employee_type,
                        attributes: ["employee_type_code"],
                        include:
                        {
                            model: model.hrd_employee_type_translations,
                            attributes: ["translation"],
                            where:
                            {
                                language_code: language
                            },
                        }
                    },
                    // {
                    //     model: model.adm_company,
                    //     attributes: ["name"],
                    // },
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
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_company: location
                        },
                        {
                            period
                        },
                        {
                            employee_type_code: type
                        }
                    ]
                },
                order: [
                    [model.hrd_employee, 'fullname', 'ASC']
                ],
            });
        }
        async function selectEmployee(selectBasicSalaryByCodeData) {
            const results = [];
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
controller.insertBasicSalary = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            location_POST: location,
            type_POST: type,
            period_date_POST: period,
            detail: details
        } = requestData;

        const isDuplicate = await checkDuplicateBasicSalary();
        if (isDuplicate) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.duplicateData);
        }
        const insertBasicSalaryData = await insertBasicSalary();
        if (!insertBasicSalaryData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');


        async function checkDuplicateBasicSalary() {
            const existing = await model.hrd_basic_salary.findOne({
                where: {
                    [Op.and]: [
                        {
                            code_company: location
                        },
                        {
                            period: period
                        },
                        {
                            employee_type_code: type
                        }
                    ]
                },
                transaction
            });
            return !!existing;
        }

        async function insertBasicSalary() {
            const detailRecords = details.map((item, index) => {
                return {
                    code_company: location,
                    employee_type_code: type,
                    period,
                    employee_id: item.employee_id_POST,
                    nominal: item.nominal_POST,
                    id_job_title: item.id_job_title_POST,
                };
            });
            return await model.hrd_basic_salary.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Insert Basic Salary`, {
                "1.username": username,
                "2.module": "insertBasicSalary",
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
controller.updateBasicSalary = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            location_POST: location,
            type_POST: type,
            period_date_POST: period,
            detail: details
        } = requestData;


        await deleteBasicSalary();
        const updateBasicSalaryData = await updateBasicSalary();
        if (!updateBasicSalaryData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function deleteBasicSalary() {
            await model.hrd_basic_salary.destroy({
                where: {
                    [Op.and]: [
                        {
                            code_company: location
                        },
                        {
                            employee_type_code: type
                        },
                        {
                            period
                        }
                    ]
                },
                transaction
            });
        };
        async function updateBasicSalary() {
            const detailRecords = details.map((item, index) => {
                return {
                    code_company: location,
                    employee_type_code: type,
                    period,
                    employee_id: item.employee_id_POST,
                    nominal: item.nominal_POST,
                    id_job_title: item.id_job_title_POST,
                };
            });
            return await model.hrd_basic_salary.bulkCreate(
                detailRecords,
                { transaction }
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
            logger.info(`Update Basic Salary`, {
                "1.username": username,
                "2.module": "updateBasicSalary",
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