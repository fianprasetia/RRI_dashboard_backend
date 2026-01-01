const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")

controller.selectPartnersType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        let selectPartnersTypeData = await model.log_partners_type.findAll({
            include: [
                {
                    model: model.log_partners_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                {
                    model: model.fat_coa,
                    // attributes: ["language_code", "translation"],
                    // where: {
                    //     language_code: language
                    // },
                },
            ],
            order: [
                ['description', 'ASC'],
            ],
            transaction: transaction,
            order: [
                ['code_partners_type', 'ASC'],
            ],
        });
        if (selectPartnersTypeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPartnersTypeData,
            });
        } else {
            await transaction.rollback()
             res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;