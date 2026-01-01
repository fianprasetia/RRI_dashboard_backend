const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectApprovalType = async function (req, res) {
    try {
        let selectApprovalTypeData = await model.adm_approval_type.findAll({
            include: {
                model: model.adm_approval_type_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectApprovalTypeData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectApprovalTypeData,
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

controller.selectApprovalTypeByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectApprovalTypeByLanguageData = await model.adm_approval_type.findAll({
            include:
                [
                    {
                        model: model.adm_approval_type_translations,
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
        if (selectApprovalTypeByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectApprovalTypeByLanguageData,
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