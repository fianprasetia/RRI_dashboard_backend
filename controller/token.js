const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const jwt = require('jsonwebtoken');
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectToken = async function (req, res) {
    try {
        var username = req.body.username_POST
        var language = req.body.language_POST
        var selectTokenData = await model.adm_user_token.findAll({
            where:
            {
                [Op.and]: [{ username: username, }, { access_type: "web" }]
            }
        });
        if (selectTokenData.length > 0) {
            if (new Date() > selectTokenData[0]["expired_at"]) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userSession,
                });
            } else {
                const token = selectTokenData[0]["token"]
                const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                const access_token = jwt.sign(
                    { username: decoded["username"] },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' }
                );
                res.status(200).json({
                    access: "success",
                    data: access_token
                });
            }
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.userSession,
            });

        }
        // if (new Date() > selectTokenData[0]["expired_at"]) {
        //     res.status(200).json({
        //         access: "failed",
        //         message: messages[language]?.userSession,
        //     });
        // } else {
        //     const token = selectTokenData[0]["token"]
        //     const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        //     const access_token = jwt.sign(
        //         { username: decoded["username"] },
        //         process.env.ACCESS_TOKEN_SECRET,
        //         { expiresIn: '1h' }
        //     );
        //     res.status(200).json({
        //         data: access_token
        //     });
        // }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.deleteToken = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.body.username_POST
        var deleteTokenData = await model.adm_user_token.destroy({
            where: {
                username: username,
            }, transaction: transaction
        },);
        if (deleteTokenData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
            });
            logger.info('Logout', {
                "1.username": `${username}`,
                "2.module": 'deleteToken',
                "3.status": 'success',
                "4.action": []
            });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
            });
        }
    } catch (error) {
        await transaction.rollback();
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectTokenAll = async function (req, res) {
    try {
        var selectTokenAllData = await model.adm_user_token.findAll({
            order: [
                ['username', 'ASC'],
                ['access_type', 'ASC'],
            ],
        });
        if (selectTokenAllData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectTokenAllData
            });
        } else {
            res.status(200).json({
                access: "failed",
            });

        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.deleteTokenType = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.body.username_POST
        var type = req.body.access_type_POST
        var deleteTokenTypeData = await model.adm_user_token.destroy({
            where: {
                  [Op.and]: [
                       
                        { access_type: type },
                        {  username: username,}
                    ]
               
            }, transaction: transaction
        },);
        if (deleteTokenTypeData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
            });
            // logger.info('Delete Token Type', {
            //     "1.username": `${usernameLogin}`,
            //     "2.module": 'deleteTokenType',
            //     "3.status": 'success',
            //     "4.action": []
            // });
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
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