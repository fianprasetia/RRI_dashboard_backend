require('dotenv').config();
const model = require("../models/index")
const koneksi = require("../config/database");
const messages = require("./message")
const jwt = require('jsonwebtoken');
var md5 = require("md5");
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectLogin = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            password_POST: password,
            username_POST: username,
        } = requestData;

        const selectLoginData = await selectLogin()
        if (selectLoginData.length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.accessFailed);
        }
        const selectAuthenticationData = await selectAuthentication(selectLoginData)
        if (selectAuthenticationData["selectAuthenticationData"].length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.userAccess);
        }
        const selectMenuData = await selectMenu(selectAuthenticationData)
        if (selectMenuData["selectMenuData"].length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.userAccess);
        }
        const selectCompanyData = await selectCompany(selectMenuData)
        if (selectCompanyData["selectCompanyData"].length === 0) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.userAccess);
        }
        const selectAccountingPeriodsData = await selectAccountingPeriods(selectCompanyData)
        if (selectAccountingPeriodsData["selectAccountingPeriodsData"].length === 0) {
            const dataResult = selectAccountingPeriodsData["data"]
            codeCompany = dataResult["dataLogin"][0]["code_company"]
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.periodNotAccess.replace("{{Location}}", `${codeCompany}`));
        }
        const selectTokenData = await selectToken(selectAccountingPeriodsData)
        if (selectTokenData["selectTokenData"].length === 0) {
            const insertTokenData = await insertToken(selectTokenData)
            var result = {
                data: insertTokenData.data,  // langsung ambil dataLogin
                token: insertTokenData.access_token
            };
            if (!insertTokenData) {
                await transaction.rollback();
                return sendFailedResponse(messages[language]?.userAccess);
            }
        } else if (new Date() < selectTokenData["selectTokenData"][0]["expired_at"]) {
            await transaction.rollback();
            return sendFailedResponse(messages[language]?.userAlready);
            // res.json({
            //     access: "failed",
            //     message: messages[language]?.userAlready,
            //     time: new Date(),
            //     timeout: selectTokenData["selectTokenData"][0]["expired_at"]
            // });
        } else {
            const deleteTokenData = await deleteToken(selectTokenData)
            if (deleteTokenData) {
                const insertTokenData = await insertToken(selectTokenData)
                var result = {
                    data: insertTokenData.data,  // langsung ambil dataLogin
                    token: insertTokenData.access_token
                };
                if (!insertTokenData) {
                    await transaction.rollback();
                    return sendFailedResponse(messages[language]?.userAccess);
                }
            }
        }
        await transaction.commit();
        sendSuccessResponse(messages[language]?.accessSuccess, result);
        logAction('success');

        async function selectLogin() {
            return await model.adm_user_login.findAll({
                include: [
                    {
                        model: model.adm_company,
                        attributes: ["name", "code_company_type", "code_company",],
                    },
                    {
                        model: model.hrd_employee,
                    },
                ],
                where: {
                    [Op.and]: [
                        { username: username },
                        { password: md5(password) }
                    ],
                },
                transaction
            });
        }
        async function selectAuthentication(selectLoginData) {
            statusUser = selectLoginData[0]["status"]
            access_web = selectLoginData[0]["access_web"]
            change_password = selectLoginData[0]["change_password"]
            if (statusUser == 0) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userStatus,
                });
                return false
            }
            if (change_password == 0) {
                res.status(200).json({
                    access: "change",
                    message: messages[language]?.resetPassword,
                    data: username
                });
                return false
            }
            if (access_web == 0) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userStatus,
                    data: username
                });
                return false
            }
            let selectAuthenticationData = await model.adm_authentication.findAll({
                where: {
                    username: username
                },
                transaction
            })
            var data = {
                dataLogin: selectLoginData,
                dataAuth: selectAuthenticationData
            }
            return { selectAuthenticationData, data }
        }
        async function selectMenu(selectAuthenticationData) {
            const dataResult = selectAuthenticationData["data"]
            var arrIdMenu = [];
            for (var i = 0; i < dataResult["dataAuth"].length; i++)
                arrIdMenu.push(dataResult["dataAuth"][i].id_menu);
            let selectMenuData = await model.adm_menu.findAll({
                include: [
                    {
                        model: model.adm_menu_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                ],
                where: {
                    [Op.and]: [{ id_menu: arrIdMenu }],
                },
                transaction: transaction,
                order: [
                    ['parent_id', 'ASC'],
                    ['level', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataLogin: dataResult["dataLogin"],
                dataMenu: selectMenuData
            }
            return { selectMenuData, data }
        }
        async function selectCompany(selectMenuData) {
            const dataResult = selectMenuData["data"]
            codeCompany = dataResult["dataLogin"][0]["adm_company"]["code_company"]
            let selectCompanyData = await model.adm_company.findAll({
                where: {
                    code_company: codeCompany
                },
                transaction: transaction
            });
            var data = {
                dataLogin: dataResult["dataLogin"],
                dataCompany: selectCompanyData,
                dataMenu: dataResult["dataMenu"],
            }
            return { selectCompanyData, data }
        }
        async function selectAccountingPeriods(selectCompanyData) {
            const dataResult = selectCompanyData["data"]
            codeCompany = dataResult["dataLogin"][0]["code_company"]
            let selectAccountingPeriodsData = await model.fat_accounting_periods.findAll({
                where: {
                    code_company: codeCompany
                },
                transaction: transaction
            });
            var data = {
                dataLogin: dataResult["dataLogin"],
                dataCompany: dataResult["dataCompany"],
                dataMenu: dataResult["dataMenu"],
                dataAccountingPeriods: selectAccountingPeriodsData
            }
            return { selectAccountingPeriodsData, data }
        }
        async function selectToken(selectAccountingPeriodsData) {
            const dataResult = selectAccountingPeriodsData["data"]
            let selectTokenData = await model.adm_user_token.findAll({
                where: {
                    username: username
                },
                transaction
            });
            var data = {
                dataLogin: dataResult["dataLogin"],
                dataCompany: dataResult["dataCompany"],
                dataMenu: dataResult["dataMenu"],
                dataAccountingPeriods: dataResult["dataAccountingPeriods"]
            }

            return { selectTokenData, data }
            // if (selectTokenData == "") {
            //     insertToken(data)
            // } else if (new Date() < selectTokenData[0]["expired_at"]) {
            //     await transaction.rollback();
            //     res.json({
            //         access: "failed",
            //         message: messages[language]?.userAlready,
            //         time: new Date(),
            //         timeout: selectTokenData[0]["expired_at"]
            //     });
            // } else {
            //     deleteToken(data)
            // }
        }
        async function insertToken(selectTokenData) {
            const dataResult = selectTokenData["data"]
            const refresh_token = jwt.sign(
                { username: username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '8h' }
            );
            var access_token = jwt.sign(
                { username: username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            let insertTokenData = await model.adm_user_token.create({
                username: username,
                token: refresh_token,
                access_type: "web",
                expired_at: new Date(Date.now() + 8 * 60 * 60 * 1000)
            }, {
                transaction
            });
            var data = {
                dataLogin: dataResult["dataLogin"],
                dataCompany: dataResult["dataCompany"],
                dataMenu: dataResult["dataMenu"],
                dataAccountingPeriods: dataResult["dataAccountingPeriods"]
            }
            // res.json(access_token)
            return { insertTokenData, data, access_token }
        }
        async function deleteToken() {
            return await model.adm_user_token.destroy(
                {
                    where: {
                        username: username,
                    }
                },
                {
                    transaction: transaction
                }
            );
        }
        function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data || {})
            });
        }
        function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
        function logAction(status) {
            logger.info(`Login`, {
                "1.username": username,
                "2.module": "selectLogin",
                "3.status": status,
                "4.action": ""
            });
        }
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
                data: []
            });
        } else {
            res.status(404).json({
                message: error.message
            });
        }
    }
}

controller.updatePasswordLoginUser = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        language = req.body.language_POST;
        username = req.body.username_POST;
        password = md5(req.body.password_POST);
        let selectUserData = await model.adm_user_login.findAll(
            {
                where: {
                    [Op.and]: [{ username: username }],
                },
            }
        );
        if (selectUserData[0]["old_password"] == password) {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.passwordSAme,
            });
        } else {
            UpdatePassword()
        }
        async function UpdatePassword() {
            let UpdatePasswordData = await model.adm_user_login.update(
                {
                    password: password,
                    change_password: 1
                },
                {
                    where: {
                        [Op.and]: [{ username: username }],
                    }, transaction: transaction
                }
            );
            if (UpdatePasswordData.length > 0) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.resetPasswordSuccess,
                    data: UpdatePasswordData
                });
                logger.info('Update Password Login', {
                    '1.username': `${username}`,
                    '2.module': 'updatePasswordLoginUser',
                    '3.status': 'success',
                    '4.action': ''
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userAccess,
                });
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
};
controller.selectLoginMobile = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.body.username_POST
        var password = md5(req.body.password_POST)
        var language = req.body.language_POST
        let selectLoginData = await model.adm_user_login.findAll({
            include: [
                {
                    model: model.adm_company,
                    attributes: ["name", "code_company_type", "code_company",],
                },
                {
                    model: model.hrd_employee,
                },
            ],
            where: {
                [Op.and]: [
                    { username: username },
                    { password: password }
                ],
            },
            // transaction: transaction
        });
        if (selectLoginData.length > 0) {
            selectAuthentication(selectLoginData)
        } else {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.accessFailed,
            });
        }
        async function selectAuthentication(selectLoginData) {
            statusUser = selectLoginData[0]["status"]
            access_mobile = selectLoginData[0]["access_mobile"]
            change_password = selectLoginData[0]["change_password"]
            if (statusUser == 0) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userStatus,
                });
                return false
            }
            if (change_password == 0) {
                res.status(200).json({
                    access: "change",
                    message: messages[language]?.resetPassword,
                    data: username
                });
                return false
            }
            if (access_mobile == 0) {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userStatus,
                    data: username
                });
                return false
            }
            let selectAuthenticationData = await model.adm_authentication_mobile.findAll({
                where: {
                    username: username
                },
                // transaction: transaction
            })
            var data = {
                dataLogin: selectLoginData,
                dataAuth: selectAuthenticationData
            }
            if (selectAuthenticationData.length > 0) {
                selectMenu(data)
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.userAccess,
                });
            }
        }
        async function selectMenu(data) {
            var arrIdMenu = [];
            for (var i = 0; i < data["dataAuth"].length; i++)
                arrIdMenu.push(data["dataAuth"][i].id_menu);
            let selectMenuData = await model.adm_menu_mobile.findAll({
                include: [
                    {
                        model: model.adm_menu_mobile_translations,
                        attributes: ["translation"],
                        where:
                        {
                            language_code: language
                        },
                    }
                ],
                where: {
                    [Op.and]: [{ id_menu: arrIdMenu }],
                },
                transaction: transaction,
                order: [
                    ['level', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataLogin: data["dataLogin"],
                dataMenu: selectMenuData
            }
            // res.json(data)
            if (selectMenuData.length > 0) {
                selectCompany(data)
            }
        }
        async function selectCompany(data) {

            codeCompany = data["dataLogin"][0]["adm_company"]["code_company"]
            let selectCompanyData = await model.adm_company.findAll({
                where: {
                    code_company: codeCompany
                },
                transaction: transaction
            });
            var data = {
                dataLogin: data["dataLogin"],
                dataCompany: selectCompanyData,
                dataMenu: data["dataMenu"],
            }
            if (selectCompanyData.length > 0) {
                selectEmployeeByWorksite(data)
            }
        }
        async function selectEmployeeByWorksite(data) {
            worksite = data["dataLogin"][0]["hrd_employee"]["worksite"]
            codeCompany = data["dataLogin"][0]["code_company"];
            let selectEmployeeByWorksiteData = await model.hrd_employee.findAll({
                attributes: ["employee_id", "worksite", "fullname", "code_company"],
                where:
                {
                    [Op.and]: [
                        {
                            worksite:
                            {
                                [Op.like]: codeCompany + "%"
                            }
                        },
                        {
                            date_of_exit: null
                        }
                    ],

                },
                transaction: transaction
            });
            var data = {
                dataLogin: data["dataLogin"],
                dataCompany: data["dataCompany"],
                dataMenu: data["dataMenu"],
                dataEmployeeGroup: selectEmployeeByWorksiteData
            }
            if (selectEmployeeByWorksiteData.length > 0) {
                selectWorksiteByCompanyCode(data)
            }
        }
        async function selectWorksiteByCompanyCode(data) {
            worksite = data["dataLogin"][0]["hrd_employee"]["worksite"]
            codeCompany = data["dataLogin"][0]["code_company"];
            let selectWorksiteByCompanyCodeData = await model.adm_company.findAll({
                attributes: ["code_company", "name", "code_company_type"],
                where:
                // {
                //     [Op.and]: [
                //         {
                //             code_company:
                //     {
                //         [Op.like]: codeCompany + "%"
                //     }
                //         },
                //         { code_company_type: "Block" }
                //     ],
                // },





                {
                    code_company:
                    {
                        [Op.like]: codeCompany + "%"
                    }
                },
                transaction: transaction
            });
            var data = {
                dataLogin: data["dataLogin"],
                dataCompany: data["dataCompany"],
                dataMenu: data["dataMenu"],
                dataEmployeeGroup: data["dataEmployeeGroup"],
                dataWorksite: selectWorksiteByCompanyCodeData
            }
            if (selectWorksiteByCompanyCodeData) {
                await transaction.commit();
                res.json({
                    access: "success",
                    message: messages[language]?.accessSuccess,
                    data: data,
                });
            }
        }
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({
            message: error,
        });
    }
}
module.exports = controller;