const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectActivity = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectActivityData = await model.adm_activity.findAll({
            include: [
                {
                    model: model.adm_activity_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
            ],
            order: [
                ['code_activity', 'ASC'],
            ],
        });
        if (selectActivityData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectActivityData,
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
controller.selectActivityByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_activity_POST
        let selectActivityTypeByCodeData = await model.adm_activity.findAll({
            include: [
                {
                    model: model.adm_activity_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                },
                {
                    model: model.adm_activity_type,
                    attributes: ["code_activity_type"],
                    include: [
                        {
                            model: model.adm_activity_type_translations,
                            attributes: ["language_code", "translation"],
                            order: [
                                ['language_code', 'ASC'],
                            ],
                            where:
                            {
                                language_code: language
                            }
                        }
                    ]
                },
                {
                    model: model.fat_coa,
                    attributes: ["code_coa"],
                    include: [
                        {
                            model: model.fat_coa_translations,
                            attributes: ["language_code", "translation"],
                            order: [
                                ['language_code', 'ASC'],
                            ],
                            where:
                            {
                                language_code: language
                            }
                        }
                    ]
                },
            ],
            where: {
                code_activity: code,
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
controller.insertActivity = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var codeActivityType = req.body[0].code_activity_type_POST
        var codeCOA = req.body[0].code_COA_POST
        var uom = req.body[0].uom_POST
        var premi = req.body[0].premi_POST
        var status = req.body[0].status_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let selectActivityData = await model.adm_activity.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.cast(Sequelize.col('code_activity'), 'text'),
                        {
                            [Op.like]: codeCOA + '%'
                        }
                    )
                ]
            },
            transaction: transaction
        });
        if (selectActivityData.length > 0) {
            var idsubstring = []
            var idsubstringPush = []
            var idsubstringMax
            for (var i = 0; i < selectActivityData.length; i++) {
                idsubstring = selectActivityData[i]['code_activity']
                idsubstringPush.push(idsubstring);
                idsubstringMax = Math.max.apply(null, idsubstringPush)
            }
            var endsubstringCodeInt = parseInt(idsubstringMax) + 1
            newCode = endsubstringCodeInt
            insertActivity(newCode)
        } else {
            no = "1"
            let noUrut = no.padStart(2, "0")
            newCode = codeCOA + noUrut
            insertActivity(newCode)
        }
        async function insertActivity(newCode) {
            let insertActivityData = await model.adm_activity.create(
                {
                    code_activity: newCode,
                    description: languageMenu,
                    code_coa: codeCOA,
                    uom: uom,
                    code_activity_type: codeActivityType,
                    premi: premi,
                    status: status,
                },
                {
                    transaction: transaction
                }
            );
            if (insertActivityData) {
                selectLanguage(insertActivityData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function selectLanguage(insertActivityData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataActivity: insertActivityData,
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
            var codeActivity = data.dataActivity.code_activity
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_activity": "' + codeActivity + '"}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertactivityTypeTranslationsData = await model.adm_activity_translations.bulkCreate(
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
                logger.info('Insert Activity', {
                    "1.username": `${username}`,
                    "2.module": 'insertActivity',
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
controller.updateActivity = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var codeActivityType = req.body[0].code_activity_type_POST
        var codeActivity = req.body[0].code_activity_POST
        var uom = req.body[0].uom_POST
        var codeCOA = req.body[0].code_COA_POST
        var premi = req.body[0].premi_POST
        var status = req.body[0].status_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateActivityData = await model.adm_activity.update(
            {
                description: languageMenu,
                code_coa: codeCOA,
                uom: uom,
                code_activity_type: codeActivityType,
                premi: premi,
                status: status,
            },
            {
                where:
                {
                    code_activity: codeActivity
                },
                transaction: transaction,
            },
        );
        if (updateActivityData) {
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
            let deleteMenuData = await model.adm_activity_translations.destroy({
                where: {
                    code_activity: codeActivity
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
                const codeAsset = JSON.parse('{"code_activity": "' + codeActivity + '"}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertActivitiData = await model.adm_activity_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertActivitiData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertActivitiData,
                });
                logger.info('Update Activity', {
                    "1.username": `${username}`,
                    "2.module": 'updateActivity',
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
controller.selectActivityByType = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_activity_type_POST
        let selectActivityByTypeData = await model.adm_activity.findAll({
            include: [
                {
                    model: model.adm_activity_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                    where:{
                        language_code:language
                    }
                },
            ],
            where: {
                code_activity_type: code,
            },
        });
        if (selectActivityByTypeData.length > 0) {
            // selectCOA(selectActivityTypeByCodeData)
            res.json({
                access: "success",
                data: selectActivityByTypeData,
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