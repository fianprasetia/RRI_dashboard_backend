const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")

controller.selectPurchaseRequest = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var companyCode = req.body.company_code_POST
        var startDate = req.body.start_date_POST
        var endDate = req.body.end_date_POST
        let selectWorksiteData = await model.adm_company.findAll({
            attributes: ["code_company"],
            include: [
                // {
                //     model: model.log_purchase_request_detail,
                //     include:{
                //         model:model.log_item_master

                //     }
                // },
                // {
                //     model: model.adm_company,
                //     attributes:["name"]
                // },
                // {
                //     model:model.log_purchase_request_approval,
                //      include:{
                //         model:model.hrd_employee,
                //         attributes:["fullname"]

                //     }

                // }
            ],
            where:
            {
                parent_code: companyCode,
            },
            transaction: transaction,
        });
        if (selectWorksiteData.length > 0) {
            selectPurchaseRequest(selectWorksiteData)
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectPurchaseRequest(selectWorksiteData) {
            var arrIdWorksite = [];
            for (var i = 0; i < selectWorksiteData.length; i++)
                arrIdWorksite.push(selectWorksiteData[i]["code_company"]);
            let selectPurchaseRequestData = await model.log_purchase_request.findAll({
                include: [
                    // {
                    //     model: model.log_purchase_request_detail,
                    //     include:{
                    //         model:model.log_item_master

                    //     }
                    // },
                    {
                        model: model.adm_company,
                        attributes: ["name"]
                    },
                    {
                        model: model.hrd_employee,
                        attributes: ["fullname"]
                    },
                    {
                        model: model.hrd_employee,
                        as: "employeePurchasing",
                        attributes: ["fullname"]
                    },
                    // {
                    //     model: model.log_purchase_request_approval,
                    //     include: {
                    //         model: model.hrd_employee,
                    //         attributes: ["fullname"]

                    //     }

                    // }
                ],
                where: {
                    [Op.and]: [

                        {
                            code_company: arrIdWorksite
                        },
                        {
                            date: {
                                [Op.between]: [startDate, endDate]
                            },
                        }

                    ]
                },
                transaction: transaction,
                order: [
                    ['date', 'ASC'],
                    ['code_purchase_request', 'ASC'],
                ],
            });
            if (selectPurchaseRequestData.length > 0) {
                await transaction.commit()
                res.status(200).json({
                    access: "success",
                    data: selectPurchaseRequestData,
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