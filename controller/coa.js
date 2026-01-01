const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectCOA = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCOAData = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            order: [
                ["code_coa", "ASC"],
                ["level_coa", "ASC"],
            ],
        });
        if (selectCOAData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectCOAData
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
controller.insertCOA = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body[0]["language_POST"]
        const username = req.body[0]["username_POST"]
        var level = req.body[0]["level_POST"]
        var parent = req.body[0]["parent_POST"]
        var type = req.body[0]["type_POST"]
        var entity = req.body[0]["entity_POST"]
        var status = req.body[0]["status_POST"]
        var languageCOA = req.body[0].detail[0].language_POST
        const selectCOAData = await model.fat_coa.findAll({
            where:
            {
                [Op.and]: [
                    { level_coa: level },
                    { parent_coa: parent },
                    { code_coa: { [Op.notLike]: "%999" } },
                ]
            },
            transaction: transaction
        }
        );
        if (selectCOAData.length > 0) {
            var endsubstringCodeInt = selectCOAData.length + parseInt(1)
            var endsubstringCodeIntToStr = endsubstringCodeInt.toString()
            var noUrut
            if (level == 4) {
                noUrut = endsubstringCodeIntToStr.padStart(2, "0")
            } else if (level == 5) {
                noUrut = endsubstringCodeIntToStr.padStart(3, "0")
            } else {
                noUrut = endsubstringCodeIntToStr
            }
            newCode = parent + noUrut
            selectCoa(newCode)
        } else {
            no = "1"
            var noUrut
            if (level == 4) {
                noUrut = no.padStart(2, "0")
            } else if (level == 5) {
                noUrut = no.padStart(3, "0")
            } else {
                noUrut = no
            }
            newCode = parent + noUrut
            selectCoa(newCode)
        }
        async function selectCoa(newCode) {
            var selectCOAByCodeData = await model.fat_coa.findAll({
                where:
                {
                    code_coa: newCode
                },
                transaction: transaction
            }
            );
            if (selectCOAByCodeData.length > 0) {
                res.status(200).json({
                    message: messages[language]?.coaMax,
                    data: [],
                });
            } else {
                insertCoa(newCode)
            }
        }
        async function insertCoa(newCode) {
            let insertCoaData = await model.fat_coa.create(
                {
                    code_coa: newCode,
                    parent_coa: parent,
                    descriptions_coa: languageCOA,
                    level_coa: level,
                    type_coa: type,
                    entity_coa: entity,
                    status_coa: status,
                },
                {
                    transaction: transaction
                }
            );
            if (insertCoaData) {
                selectLanguage(insertCoaData)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
        async function selectLanguage(insertCoaData) {
            let selectLanguageData = await model.adm_language.findAll({
                order: [
                    ['language_code', 'ASC'],
                ],
                transaction: transaction
            });
            var data = {
                dataCOA: insertCoaData,
                dataLanguage: selectLanguageData
            }
            if (selectLanguageData) {
                insertCOATranslations(data)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function insertCOATranslations(data) {
            codeMenu = data["dataCOA"]["code_coa"]
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const code_coa = JSON.parse('{"code_coa": ' + codeMenu + '}')
                const language_code = JSON.parse('{"language_code": "' + data.dataLanguage[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(code_coa, language_code, translation);
                languageData.push(code_coa);
            }
            let insertCOATranslationsData = await model.fat_coa_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertCOATranslationsData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertCOATranslationsData,
                });
                logger.info('insert COA', {
                    '1.username': `${username}`,
                    '2.module': 'insertCOA',
                    '3.status': 'success',
                    '4.action': req.body
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
        if (error.name === 'SequelizeUniqueConstraintError') {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: [], // Tidak ada data yang disimpan karena duplikasi
            });
        } else {
            // Tangani error lain yang tidak terduga
            await transaction.rollback();
            res.status(404).json({
                message: error.message,
            });
        }
    }
}
controller.selectCOAByCode = async function (req, res) {
    try {
        // var language = req.body.language_POST
        var code = req.body.code_POST
        let selectCOAByCodeData = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                order: [
                    ['language_code', 'ASC'],
                ],
            },
            where: {
                code_coa: code
            },
            order: [[model.fat_coa_translations, 'language_code', 'ASC']]
        });
        if (selectCOAByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByCodeData,
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
controller.updateCOA = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var level = req.body[0].level_POST
        var parent = req.body[0].parent_POST
        var type = req.body[0].type_POST
        var entity = req.body[0].entity_POST
        var status = req.body[0].status_POST
        var code = req.body[0].code_POST
        var language = req.body[0].language_POST
        var username = req.body[0].username_POST
        var languageMenu = req.body[0].detail[0].language_POST
        let updateMenuData = await model.fat_coa.update(
            {
                parent_coa: parent,
                descriptions_coa: languageMenu,
                level_coa: level,
                type_coa: type,
                entity_coa: entity,
                status_coa: status,
            },
            {
                where:
                {
                    code_coa: code
                },
                transaction: transaction,
            },
        );
        if (updateMenuData) {
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
                deleteCOA(selectLanguageData)
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: "Insert data failed",
                    data: [],
                });
            }
        }
        async function deleteCOA(selectLanguageData) {
            let deleteCOAData = await model.fat_coa_translations.destroy({
                where: {
                    code_coa: code
                },
                transaction: transaction
            });
            if (deleteCOAData) {
                insertCOA(selectLanguageData)
            }
        }
        async function insertCOA(selectLanguageData) {
            var languageData = []
            const jmlData = req.body[0].detail.length
            for (var i = 0; i < jmlData; i++) {
                const code_coa = JSON.parse('{"code_coa": ' + code + '}')
                const language_code = JSON.parse('{"language_code": "' + selectLanguageData[i].language_code + '"}')
                const translation = JSON.parse('{"translation": "' + req.body[0].detail[i].language_POST + '"}')
                extend(code_coa, language_code, translation);
                languageData.push(code_coa);
            }
            let insertCOAData = await model.fat_coa_translations.bulkCreate(
                languageData,
                {
                    transaction: transaction
                }
            );
            if (insertCOAData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.updateData,
                    data: insertCOAData,
                });
                logger.info('Update COA', {
                    '1.username': `${username}`,
                    '2.module': 'updateCOA',
                    '3.status': 'success',
                    '4.action': req.body
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
controller.selectCOAByLevel5 = async function (req, res) {
    try {
        var language = req.body.language_POST
        var codeWorksite = req.body.worksite_code_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: [
                { level_coa: 5 },
                { status_coa: 1 },
                {
                    entity_coa: {
                        [Op.in]: ['GLOBAL', codeWorksite]
                    },
                }
            ],
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByDepreciation = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                code_coa: {
                    [Sequelize.Op.like]: '72101%'
                },
                level_coa: '5',
                status_coa: 1
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByFixedAsset = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                [Op.or]: [
                    { code_coa: { [Op.like]: "12101%" } },
                    { code_coa: { [Op.like]: "12102%" } },
                    { code_coa: { [Op.like]: "12103%" } },
                    { code_coa: { [Op.like]: "12104%" } },
                    { code_coa: { [Op.like]: "12105%" } },
                    { code_coa: { [Op.like]: "12106%" } },
                    { code_coa: { [Op.like]: "12107%" } }
                ],
                level_coa: '5',
                status_coa: 1
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByActivityType = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                // code_coa: {
                //     [Sequelize.Op.like]: '72101%'
                // },
                level_coa: '4',
                status_coa: 1
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByPaymentVoucher = async function (req, res) {
    try {
        var language = req.body.language_POST
        var codeWorksite = req.body.worksite_code_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                [Op.and]:
                    [
                        { code_coa: { [Op.notLike]: "111%" } },
                        { code_coa: { [Op.notLike]: "112%" } },
                        { code_coa: { [Op.notLike]: "113%" } },
                        { code_coa: { [Op.notLike]: "114%" } },
                        { code_coa: { [Op.notLike]: "115%" } },
                        { code_coa: { [Op.notLike]: "12%" } },
                        { code_coa: { [Op.notLike]: "31%" } },
                        { code_coa: { [Op.notLike]: "32%" } },
                        { code_coa: { [Op.notLike]: "33%" } },
                        { code_coa: { [Op.notLike]: "34%" } },
                        { code_coa: { [Op.notLike]: "35%" } },
                        { code_coa: { [Op.notLike]: "41%" } },
                        { code_coa: { [Op.notLike]: "51%" } },
                        { code_coa: { [Op.notLike]: "72%" } },
                    ],
                status_coa: 1,
                level_coa: 5,
                entity_coa: {
                    [Op.in]: ['GLOBAL', codeWorksite]
                },
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByCashBankHeader = async function (req, res) {
    try {
        var language = req.body.language_POST
        var codeWorksite = req.body.worksite_code_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { code_coa: { [Op.like]: "11101%" } },
                            { code_coa: { [Op.like]: "11102%" } },
                        ]
                    },
                    { status_coa: 1 },
                    { level_coa: 5 },
                    {
                        entity_coa: {
                            [Op.in]: ['GLOBAL', codeWorksite]
                        }
                    }
                ]
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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
controller.selectCOAByBankAccount = async function (req, res) {
    try {
        var language = req.body.language_POST
        var codeWorksite = req.body.worksite_code_POST
        let selectCOAByLevel5Data = await model.fat_coa.findAll({
            include: {
                model: model.fat_coa_translations,
                attributes: ["language_code", "translation"],
                where: {
                    language_code: language
                },
            },
            where: {
                [Op.and]:
                    [
                        { code_coa: { [Op.like]: "11102%" } },
                    ],
                status_coa: 1,
                level_coa: 5,
                entity_coa: {
                    [Op.in]: ['GLOBAL', codeWorksite]
                },
            },
            order: [
                ["level_coa", "ASC"],
                ["code_coa", "ASC"]
            ]
        });
        if (selectCOAByLevel5Data.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCOAByLevel5Data,
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