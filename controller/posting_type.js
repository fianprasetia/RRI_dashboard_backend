const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectPostingType = async function (req, res) {
    try {
        let selectPostingTypeData = await model.adm_posting_type.findAll({
            include: {
                model: model.adm_posting_type_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectPostingTypeData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectPostingTypeData,
            });
        } else {
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
controller.selectPostingTypeByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectPostingTypeByLanguageData = await model.adm_posting_type.findAll({
            include:
                [
                    {
                        model: model.adm_posting_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    },
                ],
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectPostingTypeByLanguageData.length > 0) {
            res.status(200).json({
                access: "success",
                message: "data success",
                data: selectPostingTypeByLanguageData,
            });
        } else {
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