const model = require("../models/index")
const controller = {}
const { Op, json } = require("sequelize")

controller.selectJobTitle = async function (req, res) {
    try {
        let selectJobTitleData = await model.hrd_job_title.findAll({
            include: {
                model: model.hrd_job_title_translations,
                attributes: ["language_code", "translation"],
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectJobTitleData.length > 0) {
            res.json({
                access: "success",
                message: "Update data success",
                data: selectJobTitleData,
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
controller.selectJobTitleByLanguage = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectJobTitleByLanguageData = await model.hrd_job_title.findAll({
            include: {
                model: model.hrd_job_title_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ['description', 'ASC'],
            ],
        });
        if (selectJobTitleByLanguageData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectJobTitleByLanguageData,
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