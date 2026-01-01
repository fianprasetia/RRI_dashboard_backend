const model = require("../models/index")
const messages = require("./message")
const koneksi = require("../config/database");
const sequelize = require("sequelize");
const controller = {}
const { Op, json } = require("sequelize")
const logger = require('./logger');

controller.selectCompany = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    // where: {
                    //     language_code: language
                    // },
                }
            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyByCode = async function (req, res) {
    try {
        var language = req.body.language_POST
        var code = req.body.code_POST
        let selectCompanyByCodeData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: {
                code_company: code
            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyByCodeData.length > 0) {
            res.json({
                access: "success",
                message: "data success",
                data: selectCompanyByCodeData,
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
controller.insertCompany = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var username = req.body.username_POST
        var code = req.body.code_POST
        var level = req.body.level_POST
        var type = req.body.type_POST
        var parent = req.body.parent_POST
        var name = req.body.name_POST
        var city = req.body.city_POST
        var province = req.body.province_POST
        var address = req.body.address_POST
        var phoneNumber = req.body.phone_number_POST
        var email = req.body.email_POST
        var zipCode = req.body.zip_code_POST
        var tax = req.body.tax_POST
        var capacity = req.body.capacity_POST
        let insertCompanyData = await model.adm_company.create(
            {
                code_company: code,
                name: name,
                code_company_type: type,
                level: level,
                address: address,
                province: province,
                phone_number: phoneNumber,
                email: email,
                city: city,
                zip_code: zipCode,
                tax_identification_number: tax,
                capacity: capacity,
                parent_code: parent,
            },
            {
                transaction: transaction
            }
        );

        if (insertCompanyData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: insertCompanyData,
            });
            logger.info('Insert Company', {
                "1.username": `${username}`,
                "2.module": 'insertCompany',
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
controller.updateCompany = async function (req, res) {
    const transaction = await koneksi.transaction()
    try {
        var language = req.body.language_POST
        var username = req.body.username_POST
        var code = req.params.code
        var level = req.body.level_POST
        var type = req.body.type_POST
        var parent = req.body.parent_POST
        var name = req.body.name_POST
        var city = req.body.city_POST
        var province = req.body.province_POST
        var address = req.body.address_POST
        var phoneNumber = req.body.phone_number_POST
        var email = req.body.email_POST
        var zipCode = req.body.zip_code_POST
        var tax = req.body.tax_POST
        var capacity = req.body.capacity_POST
        let updateCompanyData = await model.adm_company.update(
            {
                name: name,
                code_company_type: type,
                level: level,
                address: address,
                province: province,
                phone_number: phoneNumber,
                email: email,
                city: city,
                zip_code: zipCode,
                tax_identification_number: tax,
                capacity: capacity,
                parent_code: parent,
            },
            {
                where:
                {
                    code_company: code
                },
                transaction: transaction
            },
        );

        if (updateCompanyData) {
            await transaction.commit();
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: updateCompanyData,
            });
            logger.info('Update Company', {
                "1.username": `${username}`,
                "2.module": 'updateCompany',
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
controller.selectCompanyByType = async function (req, res) {
    try {
        language = req.body.language_POST
        tipe = req.body.companyType_POST
        companyParent = req.body.companyParent_POST
        if (tipe == "Head") {
            location = { code_company_type: "Company" }
        } else {
            location =
            {
                [Op.and]: [{ code_company_type: "Company" }, { code_company: companyParent }]
            }
        }
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: location,
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyByWorksite = async function (req, res) {
    try {
        language = req.body.language_POST
        tipe = req.body.companyType_POST
        companyParent = req.body.companyParent_POST
        companyCode = req.body.companyCode_POST
        if (tipe == "Head") {
            location =
            {
                [Op.and]:
                    [
                        {
                            parent_code: companyParent
                        },
                        {
                            level: '03'
                        }
                    ]
            }
        } else {
            location =
            {
                [Op.and]:
                    [
                        {
                            code_company:
                            {

                                [Op.like]: companyCode + "%"
                            }
                        },
                        {
                            level:
                            {
                                [Op.in]: ['03', '04']
                            }
                        }
                    ]
            }
        }
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: location,
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyByProvince = async function (req, res) {
    try {
        var language = req.body.language_POST
        let selectCompanyData = await model.adm_company.findAll({
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('province')), 'province'] // Mengambil distinct berdasarkan province
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyChangeWorksite = async function (req, res) {
    try {
        language = req.body.language_POST
        tipe = req.body.companyType_POST
        department = req.body.department_POST
        // if (tipe == "Head" && department == "IT") {
        //     location = { level: "03" }
        // } else if (tipe == "Head") {
        //     location = { code_company_type: "Head" }
        // }
        location = department == "IT" ? { level: "03" } : tipe == "Head" ? { code_company_type: "Head" } : location;
        let selectCompanyData = await model.adm_company.findAll({
            attributes: ["code_company", "name"],
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: location,
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyApprovalWorksite = async function (req, res) {
    try {
        language = req.body.language_POST
        worksite = req.body.worksite_POST
        var location = ""
        if (worksite == "GR" || worksite == "GI") {
            location = { code_company_type: "Warehouse" }
        } else {
            location = { level: "03" }
        }
        let selectCompanyApprovalWorksiteData = await model.adm_company.findAll({
            attributes: ["code_company", "name", "level", "code_company_type"],
            where: location

        });
        if (selectCompanyApprovalWorksiteData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyApprovalWorksiteData,
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
controller.selectCompanyCOA = async function (req, res) {
    try {
        let language = req.body.language_POST;
        let selectCompanyCOAData = await model.adm_company.findAll({
            attributes: ["code_company", "name"],
            where: { level: '03' },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        let companyData = selectCompanyCOAData.map(item => item.toJSON());
        companyData.unshift({ "code_company": "GLOBAL", "name": "GLOBAL" });
        return res.status(200).json({
            access: "success",
            message: messages[language]?.insertData,
            data: companyData,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyWarehouse = async function (req, res) {
    try {
        const language = req.body.language_POST
        const worksite = req.body.worksite_POST
        let selectWarehouseData = await model.adm_company.findAll({
            where:
            {
                [Op.and]: [
                    { parent_code: worksite },
                    { code_company_type: "Warehouse" }
                ]
            },
        });
        if (selectWarehouseData.length > 0) {
            selectPeriod(selectWarehouseData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectPeriod(selectWarehouseData) {
            let location = selectWarehouseData[0]["code_company"]
            let selectPeriodData = await model.fat_accounting_periods.findAll({
                where:
                {
                    [Op.and]: [{ code_company: location }, { status: 0 }]
                },
                order: [
                    ["period", "DESC"]
                ],
                limit: 1
            });
            var data = {
                dataWarehouse: selectWarehouseData,
                dataPeriod: selectPeriodData
            }
            if (selectPeriodData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: data
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyByPVCompany = async function (req, res) {
    try {
        language = req.body.language_POST
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: {
                code_company_type: "Company"
            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyByPVLocation = async function (req, res) {
    try {
        language = req.body.language_POST
        companyParent = req.body.companyParent_POST
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: {
                parent_code: companyParent
            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyAsset = async function (req, res) {
    try {
        let language = req.body.language_POST;
        let selectCompanyAssetData = await model.adm_company.findAll({
            attributes: ["code_company", "name"],
            where: { level: '03' },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyAssetData) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.updateData,
                data: selectCompanyAssetData,
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyWarehouseCloseout = async function (req, res) {
    try {
        const language = req.body.worksite_POST
        const worksite = req.body.worksite_POST
        let selectWarehouseData = await model.adm_company.findAll({
            where:
            {
                [Op.and]: [
                    {
                        parent_code: worksite
                    },
                    {
                        code_company_type: {
                            [Op.like]: 'Warehouse%'
                        }
                    }
                ]
            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectWarehouseData.length > 0) {
            res.status(200).json({
                access: "success",
                data: selectWarehouseData
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectBlock = async function (req, res) {
    try {
        let language = req.body.language_POST;
        let worksite = req.body.worksite_POST;
        let selectDivisionData = await model.adm_company.findAll({
            attributes: ["code_company", "name"],
            where: {
                [Op.and]: [
                    {
                        level: '05'
                    },
                    {
                        parent_code: {
                            [Op.like]: worksite + '%'
                        }
                    }
                ]

            },
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectDivisionData) {
            res.status(200).json({
                access: "success",
                data: selectDivisionData,
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyByLevel02 = async function (req, res) {
    try {
        let language = req.body.language_POST;
        let selectDivisionData = await model.adm_company.findAll({
            attributes: ["code_company", "name"],
            where: {
                level: '02',
            },
            order: [
                ['code_company', 'ASC'],
            ],
        });
        if (selectDivisionData) {
            res.status(200).json({
                access: "success",
                data: selectDivisionData,
            });
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyByNecara = async function (req, res) {
    try {
        language = req.body.language_POST
        tipe = req.body.companyType_POST
        companyParent = req.body.companyParent_POST
        companyCode = req.body.companyCode_POST
        if (tipe == "Head") {
            location =
            {
                [Op.and]:
                    [
                        {
                            parent_code: companyParent
                        },
                        {
                            level: '03'
                        }
                    ]
            }
        } else {
            location =
            {
                [Op.and]:
                    [
                        {
                            code_company:
                            {

                                [Op.like]: companyCode + "%"
                            }
                        },
                        {
                            level:
                            {
                                [Op.in]: ['03']
                            }
                        }
                    ]
            }
        }
        let selectCompanyData = await model.adm_company.findAll({
            include: {
                model: model.adm_company_type,
                attributes: ["code_company_type"],
                include:
                {
                    model: model.adm_company_type_translations,
                    attributes: ["language_code", "translation"],
                    where: {
                        language_code: language
                    },
                }
            },
            where: location,
            order: [
                ['level', 'ASC'],
                ['code_company', 'ASC'],
            ],
        });
        if (selectCompanyData.length > 0) {
            res.status(200).json({
                access: "success",
                message: messages[language]?.insertData,
                data: selectCompanyData,
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
controller.selectCompanyWarehouseWorksite = async function (req, res) {
    try {
        language = req.body.language_POST
        tipe = req.body.companyType_POST
        companyParent = req.body.companyParent_POST
        companyCode = req.body.companyCode_POST
        if (tipe == "Head") {
            location =
            {
                [Op.and]:
                    [
                        {
                            parent_code: companyParent
                        },
                    ]
            }
        } else {
            location =
            {
                [Op.and]: [
                    { parent_code: companyCode },
                ]
            }
        }
        let selectCompanyCodeData = await model.adm_company.findAll({
            where: location,
            attributes: ["code_company"]
        });
        if (selectCompanyCodeData.length > 0) {
            selectWarehouse(selectCompanyCodeData)
        } else {
            res.status(200).json({
                access: "failed",
                message: messages[language]?.nodata,
                data: [],
            });
        }
        async function selectWarehouse(selectCompanyCodeData) {
            var arrIdCompany = [];
            for (var i = 0; i < selectCompanyCodeData.length; i++)
                arrIdCompany.push(selectCompanyCodeData[i]["code_company"]);
            if (tipe == "Head") {
                warehouse =
                {
                    [Op.and]:
                        [
                            {
                                parent_code: arrIdCompany
                            },
                            { code_company_type: { [Op.like]: `Warehouse%` } }
                        ]
                }
            } else {
                warehouse =
                {
                    [Op.and]: [
                        { code_company: arrIdCompany },
                        { code_company_type: { [Op.like]: `Warehouse%` } }
                    ]
                }
            }
            let selectWarehouseData = await model.adm_company.findAll({
                where: warehouse
            });

            if (selectWarehouseData.length > 0) {
                res.status(200).json({
                    access: "success",
                    data: selectWarehouseData
                });
            } else {
                res.status(200).json({
                    access: "failed",
                    message: messages[language]?.nodata,
                    data: [],
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};
controller.selectCompanyByEstate = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
        } = requestData;


        const selectEstateData = await selectEstate()
        if (selectEstateData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectEstateData);

        async function selectEstate() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    code_company_type: "Plantation"
                },
                order: ["name"]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
};
controller.selectCompanyByDivision = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            division_POST: division,
        } = requestData;

        const selectDivisionData = await selectDivision()
        if (selectDivisionData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectDivisionData);

        async function selectDivision() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    [Op.and]:
                        [
                            {
                                code_company_type: "Division"
                            },
                            {
                                parent_code: division
                            }
                        ]

                },
                order: ["name"]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
};
controller.selectCompanyByBasicSalary = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            company_type_POST: companyType,
            parent_code_POST: parentCode,
        } = requestData;


        const selectEstateData = await selectEstate()
        if (selectEstateData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectEstateData);

        async function selectEstate() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    [Op.and]: [
                        {
                            code_company_type: companyType
                        },
                        {
                            parent_code: parentCode
                        }
                    ]

                },
                order: ["name"]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
};
controller.selectCompanyByHarvest = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            worksite_POST: worksite
        } = requestData;


        const selectEstateData = await selectEstate()
        if (selectEstateData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectEstateData);

        async function selectEstate() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    code_company: worksite
                },
                order: ["name"]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
};
controller.selectCompanyByStation = async function (req, res) {
    try {
        const requestData = req.body;
        const {
            language_POST: language,
            mill_POST: mill,
        } = requestData;

        const selectStationData = await selectStation()
        if (selectStationData.length === 0) {
            return sendFailedResponse(messages[language]?.nodata);
        }

        await sendSuccessResponse(messages[language]?.successfulData, selectStationData);

        async function selectStation() {
            return await model.adm_company.findAll({
                attributes: ["code_company", "name"],
                where:
                {
                    [Op.and]:
                        [
                            // {
                            //     code_company_type: "Division"
                            // },
                            {
                                parent_code: mill
                            }
                        ]

                },
                order: [
                    ["name", "ASC"]
                ]
            });
        }
        async function sendSuccessResponse(message, data = null) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "success",
                message: message,
                ...(data && { data })
            });
        }
        async function sendFailedResponse(message) {
            if (res.headersSent) return;
            res.status(200).json({
                access: "failed",
                message: message
            });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || 'Internal server error',
            });
        }
    }
};
module.exports = controller;