const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectGender = async function (req, res) {
    try {
        let selectGenderData = await model.hrd_gender.findAll({
            include: {
                model: model.hrd_gender_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectGenderData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectGenderData,
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

controller.selectGenderByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectGenderByLanguageData = await model.hrd_gender.findAll({
            include: {
                model: model.hrd_gender_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectGenderByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectGenderByLanguageData,
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