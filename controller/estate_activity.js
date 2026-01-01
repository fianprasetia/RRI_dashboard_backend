const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json, col } = require("sequelize")
const logger = require('./logger');

controller.selectEstateActivity = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            start_date_POST: startDate,
            end_date_POST: endDate,
            company_code_POST: companyCode,
        } = requestData;

        const selectEstateActivityData = await selectEstateActivity()
        if (selectEstateActivityData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.insertData, selectEstateActivityData);

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
        async function selectEstateActivity() {
            return await model.plt_estate_activity.findAll({
                // attributes: ["code_company", "name"],
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                    },
                    {
                        model: model.adm_company,
                        attributes: ["code_company", "name"],
                        as: "location"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeForeman"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeforeman_1"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeDivision"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeLoading"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeCreate"
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["employee_id", "fullname"],
                        as: "employeeUpdate"
                    },
                ],
                where:
                {
                    [Op.and]: [
                        { worksite: companyCode },
                        {
                            date: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                        {
                            status: {
                                [sequelize.Op.not]: 2
                            },
                        }
                    ]

                },
                order: [
                    ["status", "ASC"],
                    ["transaction_no", "ASC"],
                    ["date", "ASC"],
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
controller.selectEstateActivityByAttribute = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            estate_POST: estate,
            block_POST: block,
            employee_id_POST: employee,
            date_POST: createDate,
            company_parent_POST: company,
        } = requestData;
        const [year, month] = createDate.split("-");
        const yearAndMonth = `${year}-${month}`;

        const selectBasicSalaryData = await selectBasicSalary()
        if (selectBasicSalaryData.length === 0) {
            return sendFailedResponse(messages[language]?.notifBasicSalary);
        }
        const selectAverageBunchRateData = await selectAverageBunchRate()
        if (selectAverageBunchRateData.length === 0) {
            return sendFailedResponse(messages[language]?.notifBJR);
        }
        const selectBlockMasterData = await selectBlockMaster()
        if (selectBlockMasterData.length === 0) {
            return sendFailedResponse(messages[language]?.notifBJR);
        }
        const selectHolidayData = await selectHoliday()
        const selectHarvestIncentiveData = await selectHarvestIncentive(selectHolidayData, selectAverageBunchRateData)
        if (selectHarvestIncentiveData.length === 0) {
            return sendFailedResponse(messages[language]?.notifIncentive);
        }
        var data = {
            dataBasicSalary: selectBasicSalaryData,
            dataAverageBunchRate: selectAverageBunchRateData,
            dataBlockmaster: selectBlockMasterData,
            dataHarvestIncentive: selectHarvestIncentiveData
        }

        sendSuccessResponse(messages[language]?.insertData, data);

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
        async function selectBasicSalary() {
            const data = await model.hrd_basic_salary.findAll({
                attributes: ["nominal", "employee_id"],
                include: [
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"],
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            code_company: estate
                        },
                        {
                            employee_id: employee
                        },
                        {
                            period: year
                        },
                    ]
                },
            });
            return data;
        }
        async function selectAverageBunchRate() {
            return await model.plt_average_bunch_rate.findAll({
                attributes: ["average_bunch_rate"],
                where: {
                    [Op.and]: [
                        {
                            block
                        },
                        {
                            period: yearAndMonth
                        },
                    ]
                },
                order: [
                    ['block', 'ASC'],
                ]
            });
        }
        async function selectBlockMaster() {
            return await model.plt_block_master.findAll({
                attributes: ["planting_year"],
                where: {
                    code_company: block
                },
            });
        }
        async function selectHoliday() {
            return await model.hrd_holiday.findOne({
                where: {
                    date: createDate
                },
            });
        }
        async function selectHarvestIncentive(selectHolidayData, selectAverageBunchRateData) {
            const bjrValue = selectAverageBunchRateData[0]["average_bunch_rate"]
            if (bjrValue === 0) {
                return sendFailedResponse(messages[language]?.notifBJR);
            }
            if (selectHolidayData) {
                incentive = {
                    [Op.and]: [
                        {
                            code_company: company
                        },
                        {
                            harvest_day: 1
                        },
                        {
                            start_bjr: { [Op.lte]: bjrValue },
                        },
                        {
                            end_bjr: { [Op.gt]: bjrValue }
                        }
                    ]
                }
            } else {
                incentive = {
                    [Op.and]: [
                        {
                            code_company: company
                        },
                        {
                            harvest_day: 0
                        },
                        {
                            start_bjr: { [Op.lte]: bjrValue },
                        },
                        {
                            end_bjr: { [Op.gt]: bjrValue }
                        }
                    ]
                }
            }
            return await model.plt_harvest_incentive.findAll({
                where: incentive
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
controller.insertEstateActivity = async function (req, res) {
    const transaction = await koneksi.transaction();
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            type_POST: type,
            create_date_POST: createDate,
            estate_POST: estate,
            company_code_POST: company,
            foreman_POST: foreman,
            foreman1_POST: foreman1,
            division_clerk_POST: divisionClerk,
            transport_clerk_POST: transportClerk,
            detail: details
        } = requestData;

        const yearAndMonth = createDate.split("-").slice(0, 2).join("-");
        const formattedDate = createDate.split("-").slice(0, 2).join("");

        var newCode = await generateCashBankCode();

        const insertEstateActivityData = await insertEstateActivity(newCode);
        if (!insertEstateActivityData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const insertEstateActivityDetailData = await insertEstateActivityDetail(newCode);
        if (!insertEstateActivityDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        const selectHarvestPenaltyData = await selectHarvestPenalty();
        if (selectHarvestPenaltyData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertEstateActivityPenaltyData = await insertEstateActivityPenalty(newCode, selectHarvestPenaltyData);
        if (!insertEstateActivityPenaltyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.insertData);
        logAction('success');

        async function generateCashBankCode() {
            const existingIssues = await model.plt_estate_activity.findAll({
                where: {
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        ),
                        {
                            worksite: estate
                        },
                        {
                            transaction_type: "PNN"
                        }
                    ]
                },
                transaction
            });
            let sequenceNumber;
            if (existingIssues.length > 0) {
                const maxCode = Math.max(
                    ...existingIssues.map(issue => parseInt(issue.transaction_no, 10))
                );
                const endDigits = String(maxCode).slice(-3);
                sequenceNumber = (parseInt(endDigits) + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/${estate.toUpperCase()}/PNN/${formattedDate}`;
        }
        async function insertEstateActivity(newCode) {
            return await model.plt_estate_activity.create({
                transaction_no: newCode,
                transaction_type: "PNN",
                date: createDate,
                code_company: company,
                worksite: estate,
                foreman: foreman || null,
                foreman_1: foreman1 || null,
                loading_clerk: transportClerk || null,
                division_clerk: divisionClerk || null,
                created_by: employeeID,
                update_by: employeeID,
                source_type: 0,
            }, { transaction });
        }
        async function insertEstateActivityDetail(newCode) {
            const detailRecords = details.map((item, index) => {
                return {
                    transaction_no: newCode,
                    employee_id: item.id_employee_POST,
                    code_activity: 6110100301,
                    code_company: item.block_POST,
                    planting_year: item.planting_year_POST,
                    work_result: item.work_results_POST,
                    work_result_kg: item.tonase_kilogram_POST,
                    average_bunch_weight: item.average_bunch_rate_POST,
                    basis_bunch: item.basic_ffb_POST,
                    wage: item.basic_salary_POST,
                    penalty_wage: item.total_penalty_nominal_POST,
                    premium_wage: item.incentive_basic_POST,
                    over_basis_incentive: item.bonusBasic_POST,
                    harvest_area: item.harvest_area_POST,
                    loose_fruit_weight: item.brondolan_POST,
                    loose_fruit_premium: item.bonus_brondolan_POST,
                    is_cash_payment: type,
                    total_income: item.total_income_POST,
                };
            });
            return await model.plt_estate_activity_detail.bulkCreate(
                detailRecords,
                { transaction }
            );
        }
        async function selectHarvestPenalty() {
            return await model.plt_harvest_penalty.findAll({
                attributes: ["code_harvest_penalty"],
                where: {
                    code_company: estate
                },
                order: [
                    ['code_harvest_penalty', 'ASC'],
                ],
                transaction
            });

        }
        async function insertEstateActivityPenalty(newCode, selectHarvestPenaltyData) {

            const result = details.flatMap(d =>
                selectHarvestPenaltyData.map((p, index) => ({
                    code_harvest_penalty: p.code_harvest_penalty,
                    penalty_value: d.penalty_values_POST[index],
                    id_employee: d.id_employee_POST
                }))
            );
            const detailRecords = result.map((item, index) => {
                return {
                    transaction_no: newCode,
                    employee_id: item.id_employee,
                    code_harvest_penalty: item.code_harvest_penalty,
                    value: item.penalty_value,
                };
            });
            return await model.plt_estate_activity_penalty.bulkCreate(
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
            logger.info(`Insert Estate Activity`, {
                "1.username": username,
                "2.module": "insertEstateActivity",
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
    }


};
controller.selectEstateActivityByCode = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            code_POST: code,
        } = requestData;

        const selectEstateActivityData = await selectEstateActivity()
        if (selectEstateActivityData.length == 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        sendSuccessResponse(messages[language]?.successfulData, selectEstateActivityData);
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

        async function selectEstateActivity() {
            const activities = await model.plt_estate_activity.findAll({
                include: [
                    {
                        model: model.plt_estate_activity_detail,
                        include: [
                            {
                                model: model.hrd_employee,
                                attributes: ["employee_id", "fullname"],
                            },
                        ],
                        as: "details"
                    },
                    {
                        model: model.plt_estate_activity_penalty,
                        attributes: ["employee_id", "value", "code_harvest_penalty"],
                        as: "detailsPenalty",
                        order: [["code_harvest_penalty", "ASC"]]
                    },
                ],
                where: { transaction_no: code }
            });

            return activities.map(activity => {
                const penalties = activity.detailsPenalty;

                const details = activity.details.map(detail => {
                    // filter penalties untuk employee_id terkait
                    const penaltyList = penalties
                        .filter(p => p.employee_id === detail.employee_id)
                        .sort((a, b) => a.code_harvest_penalty.localeCompare(b.code_harvest_penalty));

                    // bikin object dengan key urut
                    const penaltyObj = {};
                    penaltyList.forEach(p => {
                        penaltyObj[p.code_harvest_penalty] = p.value;
                    });

                    return {
                        ...detail.get({ plain: true }),
                        penalties: penaltyObj
                    };
                });

                return {
                    ...activity.get({ plain: true }),
                    details,
                    detailsPenalty: undefined
                };
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
controller.updateEstateActivity = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body[0];
        const {
            language_POST: language,
            username_POST: username,
            employee_id_POST: employeeID,
            code_POST: code,
            type_POST: type,
            create_date_POST: createDate,
            estate_POST: estate,
            foreman_POST: foreman,
            foreman1_POST: foreman1,
            division_clerk_POST: divisionClerk,
            transport_clerk_POST: transportClerk,
            detail: details
        } = requestData;


        const updateBasicSalaryData = await updateEstateActivity();
        if (!updateBasicSalaryData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }
        await deleteEstateActivityDetail()


        const updateEstateActivityDetailData = await updateEstateActivityDetail();
        if (!updateEstateActivityDetailData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await deleteEstateActivityPenalty()
        const selectHarvestPenaltyData = await selectHarvestPenalty();
        if (selectHarvestPenaltyData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        const insertEstateActivityPenaltyData = await insertEstateActivityPenalty(selectHarvestPenaltyData);
        if (!insertEstateActivityPenaltyData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.failedData);
        }

        await transaction.commit();
        sendSuccessResponse(messages[language]?.updateData);
        logAction('success');

        async function updateEstateActivity() {
            return await model.plt_estate_activity.update(
                {
                    date: createDate,
                    worksite: estate,
                    foreman: foreman || null,
                    foreman_1: foreman1 || null,
                    loading_clerk: transportClerk || null,
                    division_clerk: divisionClerk || null,
                    update_by: employeeID,
                },
                {
                    where:
                    {
                        transaction_no: code,
                    },
                    transaction,
                },
            );
        }
        async function deleteEstateActivityDetail() {
            await model.plt_estate_activity_detail.destroy({
                where: {
                    transaction_no: code,
                },
                transaction
            });
        };
        async function updateEstateActivityDetail() {

            const detailRecords = details.map((item, index) => {
                return {
                    transaction_no: code,
                    employee_id: item.id_employee_POST,
                    code_activity: 6110100301,
                    code_company: item.block_POST,
                    planting_year: item.planting_year_POST,
                    work_result: item.work_results_POST,
                    work_result_kg: item.tonase_kilogram_POST,
                    average_bunch_weight: item.average_bunch_rate_POST,
                    basis_bunch: item.basic_ffb_POST,
                    wage: item.basic_salary_POST,
                    penalty_wage: item.total_penalty_nominal_POST,
                    premium_wage: item.incentive_basic_POST,
                    over_basis_incentive: item.bonusBasic_POST,
                    harvest_area: item.harvest_area_POST,
                    loose_fruit_weight: item.brondolan_POST,
                    loose_fruit_premium: item.bonus_brondolan_POST,
                    is_cash_payment: type,
                    total_income: item.total_income_POST,
                };
            });
            return await model.plt_estate_activity_detail.bulkCreate(
                detailRecords,
                { transaction }
            );
        }
        async function deleteEstateActivityPenalty() {
            await model.plt_estate_activity_penalty.destroy({
                where: {
                    transaction_no: code,
                },
                transaction
            });
        };
        async function selectHarvestPenalty() {
            return await model.plt_harvest_penalty.findAll({
                attributes: ["code_harvest_penalty"],
                where: {
                    code_company: estate
                },
                order: [
                    ['code_harvest_penalty', 'ASC'],
                ],
                transaction
            });

        }
        async function insertEstateActivityPenalty(selectHarvestPenaltyData) {

            const result = details.flatMap(d =>
                selectHarvestPenaltyData.map((p, index) => ({
                    code_harvest_penalty: p.code_harvest_penalty,
                    penalty_value: d.penalty_values_POST[index],
                    id_employee: d.id_employee_POST
                }))
            );
            const detailRecords = result.map((item, index) => {
                return {
                    transaction_no: code,
                    employee_id: item.id_employee,
                    code_harvest_penalty: item.code_harvest_penalty,
                    value: item.penalty_value,
                };
            });
            return await model.plt_estate_activity_penalty.bulkCreate(
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
            logger.info(`Update Estate Activity`, {
                "1.username": username,
                "2.module": "updateEstateActivity",
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
controller.postingEstateActivity = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_POST: code,
            language_POST: language,
            username_POST: username,
            employeeID_POST: employee,
        } = requestData;

        const selectEstateActivityData = await selectEstateActivity()
        if (selectEstateActivityData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }
        await processJournalEntries(selectEstateActivityData)
        await updateBalanceMonthly(selectEstateActivityData)
        await updateEstateActivity()

        await transaction.commit();
        sendSuccessResponse(messages[language]?.postingData);
        logAction('success');

        async function selectEstateActivity() {
            return await model.plt_estate_activity.findAll({
                include: [
                    {
                        model: model.plt_estate_activity_detail,
                        as: "details"
                    },
                ],
                where: {
                    transaction_no: code
                },
            });
        }
        async function processJournalEntries(selectEstateActivityData) {
            const journalCode = await generateJournalCode(selectEstateActivityData);
            const resultCredit = await createCreditJournalEntry(journalCode, selectEstateActivityData);
            const resultDebit = await createDebitJournalEntry(journalCode, selectEstateActivityData, resultCredit);
        }
        async function generateJournalCode(selectEstateActivityData) {
            const { worksite } = selectEstateActivityData[0]
            const dateEA = selectEstateActivityData[0].date;
            const date = new Date(dateEA);
            const yearAndMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const formattedDate = yearAndMonth.split("-").slice(0, 2).join("");
            const existingJournals = await model.fat_journal.findAll({
                where: {
                    [Op.and]: [
                        { worksite },
                        sequelize.where(
                            sequelize.fn('to_char', sequelize.col('date'), 'YYYY-MM'),
                            yearAndMonth
                        )
                    ]
                },
                transaction
            });

            let sequenceNumber;
            if (existingJournals.length > 0) {
                const maxCode = Math.max(...existingJournals.map(j =>
                    parseInt(j.code_journal.split("/")[0]))
                );
                sequenceNumber = (maxCode + 1).toString().padStart(3, "0");
            } else {
                sequenceNumber = "001";
            }
            return `${sequenceNumber}/GL/${worksite}/${formattedDate}`;
        }
        async function createCreditJournalEntry(journalCode, selectEstateActivityData) {
            const {
                code_company,
                worksite,
                transaction_no,
                date,
                details: detail
            } = selectEstateActivityData[0];

            if (detail.length > 0) {
                const upahtenagakerjaTotal = detail.reduce((sum, d) => sum + (d.wage - d.penalty_wage), 0);
                const incentiveTotal = detail.reduce((sum, d) => sum + (d.premium_wage + d.over_basis_incentive), 0);
                const incentiveBrondolanTotal = detail.reduce((sum, d) => sum + d.loose_fruit_premium, 0);
                const grandTotal = upahtenagakerjaTotal + incentiveTotal + incentiveBrondolanTotal;

                const dataCredit = await model.fat_journal.create({
                    code_journal: journalCode,
                    code_company,
                    worksite,
                    code_coa: "21301001",
                    sequence_number: 1,
                    description: `${transaction_no}`,
                    dk_code: "C",
                    amount: grandTotal,
                    reference_code: transaction_no,
                    code_partners: "",
                    code_item: 0,
                    date
                }, { transaction });
                return [dataCredit];
            }
        }

        async function createDebitJournalEntry(journalCode, selectEstateActivityData, resultCredit) {
            const {
                code_company,
                worksite,
                transaction_no,
                date,
                details: detail
            } = selectEstateActivityData[0];

            if (detail.length > 0) {
                let sequence = resultCredit.length + 1;
                const createdEntries = [];

                for (const d of detail) {
                    // Hitung per employee
                    const upahtenagakerja = d.wage - d.penalty_wage;
                    const incentive = d.premium_wage + d.over_basis_incentive;
                    const incentivebrondolan = d.loose_fruit_premium;

                    // Mapping per employee
                    const journalEntries = [
                        { desc: "Upah Tenaga Kerja", amount: upahtenagakerja, coa: "61101001" },
                        { desc: "Incentive", amount: incentive, coa: "61101010" },
                        { desc: "Incentive Brondolan", amount: incentivebrondolan, coa: "61101002" }
                    ];

                    for (const entry of journalEntries) {
                        if (entry.amount > 0) {
                            const dataCredit = await model.fat_journal.create({
                                code_journal: journalCode,
                                code_company,
                                worksite,
                                code_coa: entry.coa,
                                sequence_number: sequence,
                                description: `${transaction_no} - ${entry.desc} - EmpID ${d.employee_id}`,
                                dk_code: "D",
                                amount: entry.amount,
                                reference_code: transaction_no,
                                code_partners: "",
                                code_item: 0,
                                date
                            }, { transaction });

                            createdEntries.push(dataCredit);
                        }
                        sequence++;
                    }
                }
                return createdEntries;
            }
        }
        async function updateBalanceMonthly(selectEstateActivityData) {
            const journalEntries = await model.fat_journal.findAll({
                where: { reference_code: selectEstateActivityData[0].transaction_no.toString() },
                transaction
            });
            const { code_company } = selectEstateActivityData[0];
            const { worksite } = selectEstateActivityData[0];
            const date = new Date(selectEstateActivityData[0].date);
            const periodDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            for (const entry of journalEntries) {
                const existingBalance = await model.fat_balance_monthly.findOne({
                    where: {
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                    },
                    transaction
                });
                const amount = entry.amount;
                const updateData = {
                    [entry.dk_code === "D" ? "debit" : "credit"]: sequelize.literal(
                        `${entry.dk_code === "D" ? "debit" : "credit"} + ${amount}`
                    )
                };
                if (existingBalance) {
                    var updateResult = await model.fat_balance_monthly.update(updateData, {
                        where: {
                            code_company,
                            worksite,
                            code_coa: entry.code_coa,
                            period_date: periodDate
                        },
                        transaction
                    });
                } else {
                    var createdRecord = await model.fat_balance_monthly.create({
                        code_company,
                        worksite,
                        code_coa: entry.code_coa,
                        period_date: periodDate,
                        opening_balance: 0,
                        debit: entry.dk_code === "D" ? amount : 0,
                        credit: entry.dk_code === "C" ? amount : 0,
                        status: 0
                    }, { transaction });
                }
            }
        }
        async function updateEstateActivity() {
            return await model.plt_estate_activity.update(
                {
                    status: 1,
                    update_by: employee
                },
                {
                    where: {
                        transaction_no: code
                    },
                    transaction,
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
            logger.info(`Posting Estate Activity`, {
                "1.username": username,
                "2.module": "postingEstateActivity",
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
controller.deleteEstateActivity = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            code_POST: code,
            language_POST: language,
            username_POST: username,
        } = requestData;

        const deleteEstateActivityData = await deleteEstateActivity()
        if (!deleteEstateActivityData) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.nodata);
        }


        await transaction.commit();
        sendSuccessResponse(messages[language]?.deleteData, deleteEstateActivityData);
        logAction('success');

        async function deleteEstateActivity() {
            return await model.plt_estate_activity.update(
                {
                    status: 2,
                },
                {
                    where: {
                        transaction_no: code
                    },
                    transaction,
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
            logger.info(`Delete Estate Activity`, {
                "1.username": username,
                "2.module": "deleteEstateActivity",
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