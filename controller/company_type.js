const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const controller = {}
const { Op, json } = require("sequelize")

controller.selectCompanyType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        let selectCompanyTypeData = await model.adm_company_type.findAll({
            include: {
                model: model.adm_company_type_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            attributes: ["code_company_type"],
            // order: [
            //     ['level', 'ASC'],
            //     ['code_company', 'ASC'],
            // ],
            transaction:transaction
        });
        if (selectCompanyTypeData.length > 0) {
            await transaction.commit();
            res.json({
                access: "success",
                message: "data success",
                data: selectCompanyTypeData,
            });
        } else {
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