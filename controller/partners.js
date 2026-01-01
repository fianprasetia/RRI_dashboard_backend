const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Sequelize } = require('sequelize');
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectPartners = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        let selectPartnersData = await model.log_partners.findAll({
            transaction: transaction,
            order: [
                ['code_partners', 'ASC'],
            ],
        });
        if (selectPartnersData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPartnersData,
            });
        } else {
            await transaction.rollback()
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
controller.insertPartners = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const partnersType = req.body.partners_type_POST
        const name = req.body.name_POST
        const address = req.body.address_POST
        const city = req.body.city_POST
        const phone = req.body.phone_POST
        const email = req.body.email_POST
        const contactName = req.body.contact_name_POST
        const tax = req.body.tax_POST
        const bankName = req.body.bank_name_POST
        const bankAccont = req.body.bank_account_POST
        const status = req.body.status_POST
        let selectPartnersData = await model.log_partners.findAll(
            {
                where: {
                    code_partners_type: partnersType
                }
            },
            {
                transaction: transaction
            }
        );
        if (selectPartnersData.length > 0) {
            var idsubstring = []
            var idsubstringPush = []
            var idsubstringMax
            for (var i = 0; i < selectPartnersData.length; i++) {
                idsubstring = selectPartnersData[i]['code_partners']
                idsubstringPush.push(idsubstring);
                const numbers = idsubstringPush.map(item => parseInt(item.slice(1), 10));
                idsubstringMax = Math.max.apply(null, numbers)
            }
            var substringCode = idsubstringMax.toString();
            var endsubstringCode = substringCode.substring(3, 8);
            var endsubstringCode = parseInt(endsubstringCode) + 1
            let noUrut = (endsubstringCode.toString()).padStart(5, "0")
            codeNew = partnersType + "01" + noUrut
            insertPartnersNew(codeNew)
        } else {
            no = "1"
            let noUrut = no.padStart(5, "0")
            codeNew = partnersType + "01" + noUrut
            insertPartnersNew(codeNew)
        }
        async function insertPartnersNew(codeNew) {
            let insertPartnersNewData = await model.log_partners.create(
                {
                    code_partners_type: partnersType,
                    code_partners: codeNew,
                    name: name,
                    address: address,
                    city: city,
                    phone: phone,
                    email: email,
                    contact_person: contactName,
                    tax_id: tax,
                    bank_name: bankName,
                    bank_account: bankAccont,
                    status: status,
                },
                {
                    transaction: transaction
                },
            );
            if (insertPartnersNewData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertPartnersNewData,
                });
                logger.info('Insert Partners', {
                    "1.username": `${username}`,
                    "2.module": 'insertPartners',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
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
controller.selectPartnersQuotation = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        let selectPartnersQuotationData = await model.log_partners.findAll({
            attributes: ["code_partners", "name", "city"],
            where: { code_partners_type: { [Op.in]: ['S001', 'V001'] } },
            transaction: transaction,
        });
        if (selectPartnersQuotationData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPartnersQuotationData,
            });
        } else {
            await transaction.rollback()
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
controller.selectPartnersByCode = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const code = req.body.code_partners_POST
        let selectPartnersByCodeData = await model.log_partners.findAll({
            where: { code_partners: code },
            transaction: transaction,
        });
        if (selectPartnersByCodeData.length > 0) {
            await transaction.commit()
            res.status(200).json({
                access: "success",
                data: selectPartnersByCodeData,
            });
        } else {
            await transaction.rollback()
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
controller.updatePartners = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const language = req.body.language_POST
        const username = req.body.username_POST
        const code = req.body.code_POST
        const partnersType = req.body.partners_type_POST
        const name = req.body.name_POST
        const address = req.body.address_POST
        const city = req.body.city_POST
        const phone = req.body.phone_POST
        const email = req.body.email_POST
        const contactName = req.body.contact_name_POST
        const tax = req.body.tax_POST
        const bankName = req.body.bank_name_POST
        const bankAccont = req.body.bank_account_POST
        const status = req.body.status_POST
        let updatePartnersData = await model.log_partners.update(
            {
                code_partners_type: partnersType,
                name: name,
                address: address,
                city: city,
                phone: phone,
                email: email,
                contact_person: contactName,
                tax_id: tax,
                bank_name: bankName,
                bank_account: bankAccont,
                status: status,
            },
            {
                where:
                {
                    code_partners: code
                },
                transaction: transaction
            },
        );

        if (updatePartnersData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updatePartnersData,
            });
            logger.info('Update Partners', {
                "1.username": `${username}`,
                "2.module": 'updatePartners',
                "3.status": 'success',
                "4.action": req.body
            });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;