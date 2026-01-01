const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectGrade = async function (req, res) {
    try {
        let selectGradeData = await model.hrd_grade.findAll({
            include: {
                model: model.hrd_grade_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectGradeData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectGradeData,
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

controller.selectGradeByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectGradeByLanguageData = await model.hrd_grade.findAll({
            include: {
                model: model.hrd_grade_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectGradeByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectGradeByLanguageData,
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