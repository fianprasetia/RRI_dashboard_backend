const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const eppsLib = require('./epps');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")

controller.selectJournal = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var codeCOA = req.body.code_coa_POST
        var company = req.body.company_code_POST
        var worksite = req.body.worksite_POST
        var startDate = req.body.start_date_POST
        var endDate = req.body.end_date_POST
        const firstDate = `${startDate}-01`;
        const lastDate = eppsLib.getLastDateOfMonth(endDate)
        if (worksite === "all") {
            companyData =
            {
                parent_code: company
            }
        } else {
            companyData =
            {
                code_company: worksite,
            }
        }
        let selectWorksiteData = await model.adm_company.findAll({
            attributes: ["code_company"],
            where: companyData,
            transaction: transaction,
        });
        if (selectWorksiteData.length > 0) {
            selectJournal(selectWorksiteData)
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectJournal(selectWorksiteData) {
            var arrIdWorksite = [];
            for (var i = 0; i < selectWorksiteData.length; i++)
                arrIdWorksite.push(selectWorksiteData[i]["code_company"]);
            let selectJournalyData = await model.fat_journal.findAll({
                attributes: ["code_journal"],
                where: {
                    [Op.and]: [

                        {
                            worksite: arrIdWorksite
                        },
                        {
                            date: {
                                [Op.between]: [firstDate, lastDate]
                            },
                        },
                        {
                            code_coa: codeCOA
                        }

                    ]
                },
                transaction: transaction,
                order: [
                    ['code_coa', 'ASC'],
                ],
            });
            if (selectJournalyData.length > 0) {
                selectJournalByCode(selectJournalyData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function selectJournalByCode(selectJournalyData) {
            var arrIdCodeJournal = [];
            for (var i = 0; i < selectJournalyData.length; i++)
                arrIdCodeJournal.push(selectJournalyData[i]["code_journal"]);
            let selectJournalByCodeData = await model.fat_journal.findAll({
                include: [
                    {
                        model: model.fat_coa,
                        attributes: ["code_coa"],
                        include: [
                            {
                                model: model.fat_coa_translations,
                                attributes: ["translation"],
                                where:
                                {
                                    language_code: language
                                },
                            },

                        ],

                    }
                ],
                // attributes: ["code_journal"],
                where: {
                    code_journal: arrIdCodeJournal,
                },
                transaction: transaction,
                order: [
                    ['date', 'ASC'],
                    ['code_journal', 'ASC'],
                    ['sequence_number', 'ASC'],
                ],
            });
            if (selectJournalByCodeData.length > 0) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: selectJournalByCodeData,
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}

module.exports = controller;