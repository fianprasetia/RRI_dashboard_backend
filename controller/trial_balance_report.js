const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, literal, json } = require("sequelize")

controller.selectTrialBalance = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var akun = req.body.akun_POST
        var company = req.body.company_code_POST
        var worksite = req.body.worksite_POST
        var startDate = req.body.start_date_POST
        var endDate = req.body.end_date_POST
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
            selectBalanceMonthly(selectWorksiteData)
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectBalanceMonthly(selectWorksiteData) {
            var arrIdWorksite = [];
            for (var i = 0; i < selectWorksiteData.length; i++)
                arrIdWorksite.push(selectWorksiteData[i]["code_company"]);
            let selectBalanceMonthlyData = await model.fat_balance_monthly.findAll({
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
                attributes: ["code_coa", "opening_balance", "debit", "credit"],
                where: {
                    [Op.and]: [

                        {
                            worksite: arrIdWorksite
                        },
                        {
                            period_date: {
                                [Op.between]: [startDate, endDate]
                            },
                        },
                        {
                            status: 1
                        },
                        literal("(opening_balance + debit - credit) != 0")
                    ]
                },
                transaction: transaction,
                order: [
                    ['code_coa', 'ASC'],
                ],
            });
            if (selectBalanceMonthlyData.length > 0) {
                selectCoa(selectBalanceMonthlyData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                });
            }
        }
        async function selectCoa(selectBalanceMonthlyData) {
            var arrIdCOA = [];
            for (var i = 0; i < selectBalanceMonthlyData.length; i++)
                arrIdCOA.push(selectBalanceMonthlyData[i]["code_coa"]);

            if (akun == 1) {
                coaData =
                {
                    [Op.and]: [

                        {
                            entity_coa: "GLOBAL"
                        },
                        {
                            code_coa: {
                                [Sequelize.Op.not]: arrIdCOA
                            }
                        }

                    ]
                }
            } else {
                var data = {
                    dataBalanceMonthly: selectBalanceMonthlyData,
                    dataCOAGlobal: [],
                }
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: data,
                });
                return false
            }
            let selecCOAData = await model.fat_coa.findAll({
                attributes: ["code_coa","level_coa"],
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
                where: coaData,
                transaction: transaction,
                order: [
                    ['code_coa', 'ASC'],
                ],
            });
            var data = {
                dataBalanceMonthly: selectBalanceMonthlyData,
                dataCOAGlobal: selecCOAData,
            }
            if (selecCOAData.length > 0) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: data,
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
        res.status(404).json({
            message: error,
        });
    }
}

module.exports = controller;