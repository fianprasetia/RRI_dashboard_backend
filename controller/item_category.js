const model = require("../models/index");
const messages = require("./message");
const Redis = require("./redis");
const { Op } = require("sequelize");

const controller = {};

controller.selectItemCategory = async function (req, res) {
    try {
        const language = req.body.language_POST;

        const selectItemCategoryData = await model.log_item_category.findAll({
            include: [
                {
                    model: model.log_item_category_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                {
                    model: model.fat_coa,
                    attributes: ["code_coa"],
                    include: {
                        model: model.fat_coa_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    }
                },
            ],
            order: [["code_category", "ASC"]],
        });

        if (selectItemCategoryData.length > 0) {
            return res.status(200).json({
                access: "success",
                data: selectItemCategoryData,
            });
        } else {
            return res.status(200).json({
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        // Tangani error
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = controller;
