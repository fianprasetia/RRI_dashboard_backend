const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const extend = require('extend');
const md5 = require("md5");
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectUsers = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectLoginData = await model.adm_user_login.findAll({
            include: [
                {
                    model: model.adm_company,
                    attributes: ["name", "code_company_type", "parent_code"],
                },
                {
                    model: model.hrd_employee,
                },
            ],
        },
        );
        if (selectLoginData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectLoginData,
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
controller.insertUsers = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var username = req.body.username_POST
        var usernameLogin = req.body.username_login_POST
        var employeeId = req.body.employeeID_POST
        var password = md5(req.body.password_POST)
        var location = req.body.location_POST
        var accessWeb = req.body.accessWeb_POST
        var accessMobile = req.body.accessMobile_POST
        var status = req.body.status_POST
        let insertLoginData = await model.adm_user_login.findAll(
            {
                where: {
                    username: username
                },
            },
            {
                transaction: transaction
            }
        );
        if (insertLoginData.length > 0) {
            await transaction.rollback();
            res.status(200).json({
                access: "failed",
                message: messages[language]?.userExists,
            });
        } else {
            await insertUsersLogin()
        }
        async function insertUsersLogin() {
            let insertLoginNewData = await model.adm_user_login.create(
                {
                    username: username,
                    employee_id: employeeId,
                    password: password,
                    old_password: password,
                    code_company: location,
                    change_password: 0,
                    access_web: accessWeb,
                    access_mobile: accessMobile,
                    status: status,
                },
                {
                    transaction: transaction
                }
            );
            if (insertLoginNewData) {
                await transaction.commit();
                res.status(200).json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertLoginNewData,
                });
                logger.info('Insert User', {
                    "1.username": `${usernameLogin}`,
                    "2.module": 'insertUsers',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback();
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
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
controller.selectUsersByUsername = async function (req, res) {
    try {
        var language = req.body.language_POST
        var username = req.body.username_POST
        let selectUsersByUsernameData = await model.adm_user_login.findAll({
            include: [
                {
                    model: model.adm_company,
                    attributes: ["name", "code_company_type", "parent_code"],
                },
                {
                    model: model.hrd_employee,
                },
            ],
            where: {
                username: username
            },
        });
        if (selectUsersByUsernameData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectUsersByUsernameData,
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
controller.updatePassword = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.params.username
        var language = req.body.language_POST
        const usernameLogin = req.body.username_POST
        var password = md5(req.body.password_POST)
        let updatePasswordData = await model.adm_user_login.update(
            {
                password: password,
                old_password: password,
                change_password: 0,
            },
            {
                where:
                {
                    username: username
                },
                transaction: transaction
            },
        );

        if (updatePasswordData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updatePasswordData,
            });
            logger.info('Update Password User', {
                "1.username": `${usernameLogin}`,
                "2.module": 'updatePassword',
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
controller.updateUsers = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.params.username
        var language = req.body.language_POST
        const usernameLogin = req.body.username_POST
        var employeeID = req.body.employeeID_POST
        var location = req.body.location_POST
        var accessWeb = req.body.accessWeb_POST
        var accessMobile = req.body.accessMobile_POST
        var status = req.body.status_POST
        let updateUsersData = await model.adm_user_login.update(
            {
                username: username,
                code_company: location,
                access_web: accessWeb,
                access_mobile: accessMobile,
                status: status,
            },
            {
                where:
                {
                    employee_id: employeeID,
                },
                transaction: transaction
            },
        );

        if (updateUsersData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateUsersData,
            });
            logger.info('Update User', {
                "1.username": `${usernameLogin}`,
                "2.module": 'updateUsers',
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
controller.selectAuthByUsername = async function (req, res) {
    try {
        language = req.body.language_POST
        username = req.body.username_POST
        let selectAuthByUsernameData = await model.adm_authentication.findAll({
            include: [
                {
                    model: model.adm_menu,
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
                    order: [
                        ['level', 'ASC'],
                        ['no_ordinal', 'ASC'],
                    ],
                }
            ],
            where:
            {
                username: username
            },
            order: [
                ['id_menu', 'ASC'],
            ],
        });
        var data = {
            dataAuth: selectAuthByUsernameData
        }
        if (selectAuthByUsernameData.length > 0) {
            getMenu(data)
        } else {
            getMenuAll2()
        }
        async function getMenu(data) {
            var arrIdMenu = [];
            for (var i = 0; i < data["dataAuth"].length; i++)
                arrIdMenu.push(data["dataAuth"][i].id_menu);
            var getMenuAll = await model.adm_menu.findAll({
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
                order: [
                    ['level', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
                where: {
                    id_menu: {
                        [sequelize.Op.not]: arrIdMenu
                    }
                },
                order: [
                    ['id_menu', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataAuth: data["dataAuth"],
                dataMenu: getMenuAll,
            }
            res.status(200).json({
                access: "success",
                message: "Akun privilage anda",
                data: data
            });

        }
        async function getMenuAll2() {
            let getMenuAll2Date = await model.adm_menu.findAll({
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
                order: [
                    ['id_menu', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataAuth: [],
                dataMenu: getMenuAll2Date,
            }
            if (getMenuAll2Date.length > 0) {
                res.status(200).json({
                    access: "success",
                    // message: "Akun anda belum ada privilage, silahkan hubungi administrator",
                    data: data
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    // message: "Akun anda belum ada privilage, silahkan hubungi administrator",
                    data: data
                });
            }

        };
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertAuthByUsername = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.body["dataAuth"][0]["username_POST"]
        var language = req.body["dataLanguage"]["language_POST"]
        var usernameLogin = req.body["dataUsername"]["username_POST"]

        var menuUserAccess = []
        var id_menu_POST = [];
        var username_POST = [];
        var jml = req.body["dataAuth"].length
        for (var i = 0; i < jml; i++) {
            id_menu_POST = JSON.parse('{"id_menu": ' + req.body["dataAuth"][i]["userprivilege_POST"] + '}')
            username_POST = JSON.parse('{"username": "' + req.body["dataAuth"][i]["username_POST"] + '"}')
            extend(id_menu_POST, username_POST);
            menuUserAccess.push(id_menu_POST);
        }
        let deleteAuthMenuByUsernameData = await model.adm_authentication.destroy({
            where: {
                username: username
            },
            transaction: transaction
        });

        if (deleteAuthMenuByUsernameData > 0) {
            await insertAuthByUsernameData(menuUserAccess)
        } else {
            await insertAuthByUsernameData(menuUserAccess)
        }
        async function insertAuthByUsernameData(menuUserAccess) {

            let insertAuthMenuData = await model.adm_authentication.bulkCreate(
                menuUserAccess, { transaction: transaction }
            );
            if (res.status(200)) {
                await transaction.commit()
                res.json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAuthMenuData,
                });
                logger.info('Insert Auth By Username', {
                    "1.username": `${usernameLogin}`,
                    "2.module": 'insertAuthByUsername',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
controller.selectUsersWeb = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectLoginData = await model.adm_user_login.findAll(
            {
                // include: [
                //     {
                //         model: model.adm_company,
                //         attributes: ["name", "code_company_type", "parent_code"],
                //     },
                //     {
                //         model: model.hrd_employee,
                //     },
                // ],
                where: {
                    access_web: 1
                },
                order: [
                    ['username', 'ASC'],
                ],
            },
        );
        if (selectLoginData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectLoginData,
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
controller.selectUsersMobile = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectLoginData = await model.adm_user_login.findAll(
            {
                // include: [
                //     {
                //         model: model.adm_company,
                //         attributes: ["name", "code_company_type", "parent_code"],
                //     },
                //     {
                //         model: model.hrd_employee,
                //     },
                // ],
                where: {
                    access_mobile: 1
                },
                order: [
                    ['username', 'ASC'],
                ],
            },
        );
        if (selectLoginData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectLoginData,
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
controller.insertAuthCopyUser = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const usernameLogin = req.body.username_POST
        var source = req.body.source_POST
        var target = req.body.target_POST
        let selectAuthsourceData = await model.adm_authentication.findAll({
            where:
            {
                username: source
            },
            order: [
                ['id_menu', 'ASC'],
            ],
        });
        var data = {
            dataAuthTarget: selectAuthsourceData
        }
        if (selectAuthsourceData.length > 0) {
            deletetarget(data)
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
            });
        }
        async function deletetarget(data) {
            let deleteAuthMenuByUserData = await model.adm_authentication.destroy({
                where: {
                    username: target
                },
            });
            if (deleteAuthMenuByUserData > 0) {
                insertAuthsource(data)
            } else {
                insertAuthsource(data)
            }
        }
        async function insertAuthsource(data) {
            var menuUserAccess = []
            for (var i = 0; i < data["dataAuthTarget"].length; i++) {
                id_menu = JSON.parse('{"id_menu": ' + data["dataAuthTarget"][i].id_menu + '}')
                username = JSON.parse('{"username": "' + req.body.target_POST + '"}')
                extend(username, id_menu);
                menuUserAccess.push(username);
            }
            var insertAuthsourceData = await model.adm_authentication.bulkCreate(
                menuUserAccess,
                {
                    transaction: transaction
                }
            );
            if (insertAuthsourceData.length > 0) {
                await transaction.commit()
                res.json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAuthsourceData,
                });
                logger.info('Insert Auth Copy User', {
                    "1.username": `${usernameLogin}`,
                    "2.module": 'insertAuthCopyUser',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
controller.updateWorksite = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.params.username
        var language = req.body.language_POST
        var worksite = req.body.worksite_POST
        let updateWorksiteData = await model.adm_user_login.update(
            {
                code_company: worksite,
            },
            {
                where:
                {
                    username: username
                },
                transaction: transaction
            },
        );

        if (updateWorksiteData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateWorksiteData,
            });
            logger.info('Update Worksite', {
                "1.username": `${username}`,
                "2.module": 'updateWorksite',
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
controller.selectAuthMobileByUsername = async function (req, res) {
    try {
        language = req.body.language_POST
        username = req.body.username_POST
        let selectAuthByUsernameData = await model.adm_authentication_mobile.findAll({
            include: [
                {
                    model: model.adm_menu_mobile,
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
                    order: [
                        ['level', 'ASC'],
                        ['no_ordinal', 'ASC'],
                    ],
                }
            ],
            where:
            {
                username: username
            },
            order: [
                ['id_menu', 'ASC'],
            ],
        });
        var data = {
            dataAuth: selectAuthByUsernameData
        }
        if (selectAuthByUsernameData.length > 0) {
            getMenu(data)
        } else {
            getMenuAll2()
        }
        async function getMenu(data) {
            var arrIdMenu = [];
            for (var i = 0; i < data["dataAuth"].length; i++)
                arrIdMenu.push(data["dataAuth"][i].id_menu);
            var getMenuAll = await model.adm_menu_mobile.findAll({
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
                order: [
                    ['level', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
                where: {
                    id_menu: {
                        [sequelize.Op.not]: arrIdMenu
                    }
                },
                order: [
                    ['id_menu', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataAuth: data["dataAuth"],
                dataMenu: getMenuAll,
            }
            res.status(200).json({
                access: "success",
                message: "Akun privilage anda",
                data: data
            });

        }
        async function getMenuAll2() {
            let getMenuAll2Date = await model.adm_menu_mobile.findAll({
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
                order: [
                    ['id_menu', 'ASC'],
                    ['no_ordinal', 'ASC'],
                ],
            });
            var data = {
                dataAuth: [],
                dataMenu: getMenuAll2Date,
            }
            if (getMenuAll2Date.length > 0) {
                res.status(200).json({
                    access: "success",
                    // message: "Akun anda belum ada privilage, silahkan hubungi administrator",
                    data: data
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    // message: "Akun anda belum ada privilage, silahkan hubungi administrator",
                    data: data
                });
            }

        };
    } catch (error) {
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertAuthMobileByUsername = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var username = req.body["dataAuth"][0]["username_POST"]
        var language = req.body["dataLanguage"]["language_POST"]
        var usernameLogin = req.body["dataUsername"]["username_POST"]

        var menuUserAccess = []
        var id_menu_POST = [];
        var username_POST = [];
        var jml = req.body["dataAuth"].length
        for (var i = 0; i < jml; i++) {
            id_menu_POST = JSON.parse('{"id_menu": ' + req.body["dataAuth"][i]["userprivilege_POST"] + '}')
            username_POST = JSON.parse('{"username": "' + req.body["dataAuth"][i]["username_POST"] + '"}')
            extend(id_menu_POST, username_POST);
            menuUserAccess.push(id_menu_POST);
        }
        let deleteAuthMenuByUsernameData = await model.adm_authentication_mobile.destroy({
            where: {
                username: username
            },
            transaction: transaction
        });

        if (deleteAuthMenuByUsernameData > 0) {
            await insertAuthByUsernameData(menuUserAccess)
        } else {
            await insertAuthByUsernameData(menuUserAccess)
        }
        async function insertAuthByUsernameData(menuUserAccess) {

            let insertAuthMenuData = await model.adm_authentication_mobile.bulkCreate(
                menuUserAccess, { transaction: transaction }
            );
            if (res.status(200)) {
                await transaction.commit()
                res.json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAuthMenuData,
                });
                logger.info('Insert Auth Mobile By Username', {
                    "1.username": `${usernameLogin}`,
                    "2.module": 'insertAuthMobileByUsername',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
controller.insertAuthCopyUserMobile = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        const usernameLogin = req.body.username_POST
        var source = req.body.source_POST
        var target = req.body.target_POST
        let selectAuthsourceData = await model.adm_authentication_mobile.findAll({
            where:
            {
                username: source
            },
            order: [
                ['id_menu', 'ASC'],
            ],
        });
        var data = {
            dataAuthTarget: selectAuthsourceData
        }
        if (selectAuthsourceData.length > 0) {
            deletetarget(data)
        } else {
            await transaction.rollback()
            res.status(200).json({
                access: "failed",
                message: messages[language]?.failedData,
            });
        }
        async function deletetarget(data) {
            let deleteAuthMenuByUserData = await model.adm_authentication_mobile.destroy({
                where: {
                    username: target
                },
            });
            if (deleteAuthMenuByUserData > 0) {
                insertAuthsource(data)
            } else {
                insertAuthsource(data)
            }
        }
        async function insertAuthsource(data) {
            var menuUserAccess = []
            for (var i = 0; i < data["dataAuthTarget"].length; i++) {
                id_menu = JSON.parse('{"id_menu": ' + data["dataAuthTarget"][i].id_menu + '}')
                username = JSON.parse('{"username": "' + req.body.target_POST + '"}')
                extend(username, id_menu);
                menuUserAccess.push(username);
            }
            var insertAuthsourceData = await model.adm_authentication_mobile.bulkCreate(
                menuUserAccess,
                {
                    transaction: transaction
                }
            );
            if (insertAuthsourceData.length > 0) {
                await transaction.commit()
                res.json({
                    access: "success",
                    message: messages[language]?.insertData,
                    data: insertAuthsourceData,
                });
                logger.info('Insert Auth Copy User Mobile', {
                    "1.username": `${usernameLogin}`,
                    "2.module": 'insertAuthCopyUserMobile',
                    "3.status": 'success',
                    "4.action": req.body
                });
            } else {
                await transaction.rollback()
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.failedData,
                });
            }
        }
    } catch (error) {
        await transaction.rollback()
        res.status(404).json({
            message: error,
        });
    }
}
module.exports = controller;