const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const { Sequelize } = require('sequelize');
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectAssetSubType = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectAssetSubTypeData = await model.fat_asset_subtype.findAll({
            include: [
                {
                    model: model.fat_asset_subtype_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                {
                    model: model.fat_asset_type,
                    include: {
                        model: model.fat_asset_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    }
                },
            ],
            order: [
                ['code_asset_subtype', 'ASC'],
            ],
        });
        if (selectAssetSubTypeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetSubTypeData,
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
controller.selectAssetSubTypeByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectAssetSubTypeByCodeData = await model.fat_asset_subtype.findAll({
            include: [
                {
                    model: model.fat_asset_subtype_translations,
                    attributes: ["language_code", "translation"],
                    order: [
                        ['language_code', 'ASC'],
                    ],
                },
                {
                    model: model.fat_asset_type,
                    include: {
                        model: model.fat_asset_type_translations,
                        attributes: ["language_code", "translation"],
                        where: {
                            language_code: language
                        },
                    }
                },
            ],
            where: {
                code_asset_subtype: code,
            },
        });
        if (selectAssetSubTypeByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetSubTypeByCodeData,
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
controller.insertAssetSubType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var usefulLite = req.body[0].usefullite_POST
        var assetType = req.body[0].asset_type_POST
        // var code = req.body[0].code_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let insertAssetSubTypeData = await model.fat_asset_subtype.findAll({
            where: {
                code_asset_subtype: {
                    [Sequelize.Op.like]: assetType + '%'
                }
            },
            transaction: transaction
        });
        if (insertAssetSubTypeData.length > 0) {
            var idsubstring = []
            var idsubstringPush = []
            var idsubstringMax
            for (var i = 0; i < insertAssetSubTypeData.length; i++) {
                idsubstring = insertAssetSubTypeData[i]['code_asset_subtype']
                lastSegment = idsubstring.slice(-2);
                idsubstringPush.push(lastSegment);
                idsubstringMax = Math.max.apply(null, idsubstringPush)
            }
            var endsubstringCodeInt = parseInt(idsubstringMax) + 1
            let noUrut = (endsubstringCodeInt.toString()).padStart(2, "0")
            newCode = assetType + noUrut
            insertAssetSubType(newCode)
        } else {
            no = "1"
            let noUrut = no.padStart(2, "0")
            newCode = assetType + noUrut
            insertAssetSubType(newCode)
        }
        async function insertAssetSubType(newCode) {
            let insertAssetSubTypeData = await model.fat_asset_subtype.create(
                {
                    code_asset_subtype: newCode,
                    description: languageMenu,
                    code_asset_type: assetType,
                    useful_life: usefulLite,
                },
                {
                    transaction: transaction
                }
            );
            if (insertAssetSubTypeData) {
                selectLanguage(insertAssetSubTypeData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function selectLanguage(insertAssetSubTypeData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataSubTypeData: insertAssetSubTypeData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertAssetSubTypeTranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertAssetSubTypeTranslations(data) {
            var codeAssetSubType = data.dataSubTypeData.code_asset_subtype
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_asset_subtype": "' + codeAssetSubType + '"}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertAssetSubTypeTranslationsData = await model.fat_asset_subtype_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertAssetSubTypeTranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAssetSubTypeTranslationsData,
                });
                logger.info('Insert Asset SubType', {
                    "1.username": `${username}`,
                    "2.module": 'insertAssetSubType',
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
        res.status(404).json({
            message: error,
        });
    }
}
controller.updateAssetSubType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var usefullite = req.body[0].usefullite_POST
        var assettype = req.body[0].asset_type_POST
        var code = req.body[0].code_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateAssetSubTypeData = await model.fat_asset_subtype.update(
            {
                code_asset_type: assettype,
                description: languageMenu,
                useful_life: usefullite,
            },
            {
                where:
                {
                    code_asset_subtype: code,
                },
                transaction: transaction,
            },
        );
        if (updateAssetSubTypeData) {
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
                deleteAssetSubType(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteAssetSubType(selectLanguageData) {
            let ddeleteAssetSubTypeData = await model.fat_asset_subtype_translations.destroy({
                where: {
                    code_asset_subtype: code,
                },
                transaction: transaction
            });
            if (ddeleteAssetSubTypeData) {
                insertAssetType(selectLanguageData)
            }
        }
        async function insertAssetType(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const codeAsset = JSON.parse('{"code_asset_subtype": "' + code + '"}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(codeAsset, language_code, translation);
                languageData.push(codeAsset);
            }
            let insertMenuData = await model.fat_asset_subtype_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertMenuData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertMenuData,
                });
                logger.info('Update Asset Sub Type', {
                    "1.username": `${username}`,
                    "2.module": 'updateAssetSubType',
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
controller.selectAssetSubTypeByAssetTypeCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectAssetSubTypeByCodeData = await model.fat_asset_subtype.findAll({
            include: [
                {
                    model: model.fat_asset_subtype_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                },
                // {
                //     model: model.fat_asset_type,
                //     include: {
                //         model: model.fat_asset_type_translations,
                //         attributes: ["language_code", "translation"],
                //         where: {
                //             language_code: language
                //         },
                //     }
                // },
            ],
            where: {
                code_asset_type: code,
            },
            order: [
                ['code_asset_subtype', 'ASC'],
            ],
        });
        if (selectAssetSubTypeByCodeData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectAssetSubTypeByCodeData,
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