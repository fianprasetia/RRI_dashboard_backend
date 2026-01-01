const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const extend = require('extend');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectReceivingLocations = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectReceivingLocationsData = await model.log_receiving_locations.findAll({
            order: [
                ['id_receiving_locations', 'ASC']
            ],
        });
        if (selectReceivingLocationsData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectReceivingLocationsData,
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
controller.selectreceiving_locationsByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectreceiving_locationsByCodeData = await model.log_receiving_locations.findAll({
            where: {
                id_receiving_locations: code
            },
        });
        if (selectreceiving_locationsByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectreceiving_locationsByCodeData,
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
controller.updateReceivingLocations = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const username = req.body.username_POST
        var code = req.body.code_POST
        var name = req.body.name_locations_POST
        var address = req.body.address_POST
        var contactPerson = req.body.contact_person_POST
        var contactPhone = req.body.contact_phone_POST
        var status = req.body.status_POST
        let updateReceivingLocationsData = await model.log_receiving_locations.update(
            {
                name: name,
                address: address,
                contact_person: contactPerson,
                contact_phone: contactPhone,
                status: status,
            },
            {
                where:
                {
                    id_receiving_locations: code
                },
                transaction: transaction,
            },
        );
        if (updateReceivingLocationsData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateReceivingLocationsData,
            });
            logger.info('Update Receiving Locations', {
                "1.username": `${username}`,
                "2.module": 'updateReceivingLocations',
                "3.status": 'success',
                "4.action": req.body
            });
        } else {
            await transaction.rollback();
            res.status(200).json({
                message: messages[language]?.nodata,
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertReceivingLocations = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const username = req.body.username_POST
        var name = req.body.name_locations_POST
        var address = req.body.address_POST
        var contactPerson = req.body.contact_person_POST
        var contactPhone = req.body.contact_phone_POST
        var status = req.body.status_POST
        let insertReceivingLocationsData = await model.log_receiving_locations.create(
            {
                name: name,
                address: address,
                contact_person: contactPerson,
                contact_phone: contactPhone,
                status: status,
            },
            {
                transaction: transaction
            }
        );
        if (insertReceivingLocationsData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: insertReceivingLocationsData,
            });
            logger.info('Insert Receiving Locations', {
                "1.username": `${username}`,
                "2.module": 'insertReceivingLocations',
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