const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectActivityType = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectActivityTypeData = await model.adm_activity_type.findAll({
            include: [
                {
                    model: model.adm_activity_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
            ],
            order: [
                ['code_activity_type', 'ASC'],
            ],
        });
        if (selectActivityTypeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectActivityTypeData,
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
controller.selectActivityTypeByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_activity_type_POST
        let selectActivityTypeByCodeData = await model.adm_activity_type.findAll({
            include: [
                {
                    model: model.adm_activity_type_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                },
            ],
            where: {
                code_activity_type: code,
            },
        });
        if (selectActivityTypeByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectActivityTypeByCodeData,
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
controller.insertActivityType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var codeActivityType = req.body[0].code_activity_type_POST
        var detailCOA = req.body[0].detailCOA
        var languageMenu = req.body[0].detail[0].language_POST
        const codeCOAList = detailCOA.map(item => item.code_coa_POST).join(',');
        let selectActivityTypeData = await model.adm_activity_type.findAll({
            where: {
                code_activity_type: codeActivityType
            },
            transaction: transaction
        });
        if (selectActivityTypeData.length > 0) {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.duplicateData,
                data: [],
            });
        } else {
            insertActivityType()
        }
        async function insertActivityType() {
            let insertActivityTypeData = await model.adm_activity_type.create(
                {
                    code_activity_type: codeActivityType,
                    description: languageMenu,
                    code_coa: codeCOAList
                },
                {
                    transaction: transaction
                }
            );
            if (insertActivityTypeData) {
                selectLanguage(insertActivityTypeData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function selectLanguage(insertActivityTypeData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataTypeData: insertActivityTypeData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertActivityTypeTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertActivityTypeTranslations(data) {
            var codeAssetType = data.dataTypeData.code_activity_type
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_activity_type": "' + codeAssetType + '"}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertactivityTypeTranslationsData = await model.adm_activity_type_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertactivityTypeTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertactivityTypeTranslationsData,
                });
                logger.info('Insert Activity Type', {
                    "1.username": `${username}`,
                    "2.module": 'insertActivityType',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.updateActivityType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var codeActivityType = req.body[0].code_activity_type_POST
        var detailCOA = req.body[0].detailCOA
        var languageMenu = req.body[0].detail[0].language_POST
        const codeCOAList = detailCOA.map(item => item.code_coa_POST).join(',');
        let updateActivityTypeData = await model.adm_activity_type.update(
            {
                description: languageMenu,
                code_coa: codeCOAList
            },
            {
                where:
                {
                    code_activity_type: codeActivityType
                },
                transaction: transaction,
            },
        );
        if (updateActivityTypeData) {
            await selectLanguage()
        } else {
            await transaction.rollback();
            res.status(200).json({
                message: messages[language]?.nodata,
            });
        }
        async function selectLanguage() {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            if (selectLanguageData) {
                deleteAssetType(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteAssetType(selectLanguageData) {
            let deleteMenuData = await model.adm_activity_type_translations.destroy({
                where: {
                    code_activity_type: codeActivityType
                },
                transaction: transaction
            });
            if (deleteMenuData) {
                insertAssetType(selectLanguageData)
            }
        }
        async function insertAssetType(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_activity_type": "' + codeActivityType + '"}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertActivitiTypeData = await model.adm_activity_type_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertActivitiTypeData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertActivitiTypeData,
                });
                logger.info('Update Activity Type', {
                    "1.username": `${username}`,
                    "2.module": 'updateActivityType',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectActivityTypeByActivity = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_activity_type_POST
        let selectActivityTypeByCodeData = await model.adm_activity_type.findAll({
            include: [
                {
                    model: model.adm_activity_type_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                },
            ],
            where: {
                code_activity_type: code,
            },
        });
        if (selectActivityTypeByCodeData.length > 0) {
            selectCOA(selectActivityTypeByCodeData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }

        async function selectCOA(selectActivityTypeByCodeData) {
            codeCOA = selectActivityTypeByCodeData[0]["code_coa"]; // misalnya: "61107,61201,61202,61203"
            codeCOA = codeCOA.split(",").map(c => c.trim()); // hasil: ["61107", "61201", "61202", "61203"]
            
            const likeConditions = codeCOA.map(code => ({
                code_coa: { [Op.like]: `${code}%` }
            }));

            let selectCOAData = await model.fat_coa.findAll({
                include: {
                    model: model.fat_coa_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                where: {
                    [Op.and]: [
                        { [Op.or]: likeConditions },
                        { level_coa: '5' },
                        { status_coa: 1 }
                    ]
                },
                order: [
                    ["level_coa", "ASC"],
                    ["code_coa", "ASC"]
                ]
            });

            if (selectCOAData.length > 0) {
                res.json({
                    access: "success",
                    data: selectCOAData,
                });
            } else {
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
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