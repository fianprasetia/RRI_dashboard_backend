const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const fat_asset_subtype_translations = require("./fat_asset_subtype_translations")
const hrd_employee = require("./hrd_employee")
// const adm_company = require("./adm_company")
// const adm_activity_type = require("./adm_activity_type")
const plt_estate_activity_detail = koneksi.define(
    "plt_estate_activity_detail",
    {
        transaction_no: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "plt_estate_activity",
                key: "transaction_no"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        employee_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        code_activity: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: "adm_activity",
                key: "code_activity"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_company: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        planting_year: {
            type: Sequelize.STRING,
            allowNull: false
        },
        work_result: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
        work_result_kg: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "hasil kerja kg"
        },
        // total_work_days: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        average_bunch_weight: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "BJR"
        },
        basis_bunch: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "Basis Janjang"
        },
        // minimum_output: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        wage: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "upah kerja"
        },
        penalty_wage: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "upah penalti"
        },
        premium_wage: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "premi sampai basis"
        },
        over_basis_incentive: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "Premi Lebih Basis"
        },
        // minimum_wage_rate: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        // block_status: {
        //     type: Sequelize.STRING(4)
        // },
        // is_premium_work: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        // dp_01: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_02: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_03: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_04: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_05: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_06: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_07: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_08: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        // },
        // dp_09: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        // dp_09: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        // dp_10: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        // dp_11: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0
        // },
        harvest_area: {
            type: Sequelize.DOUBLE,
            allowNull: true,
            comment: "luas panen"
        },
        // segment_code: {
        //     type: Sequelize.STRING,
        // },
        loose_fruit_weight: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "brondolan"
        },
        loose_fruit_premium: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            comment: "premi brondolan"
        },
        // penalty_bunch_count: {
        //     type: Sequelize.DOUBLE,
        //     defaultValue: 0,
        //     comment: "janjang penalty"
        // },
        is_cash_payment: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            comment: "kontanan atau tidak"
        },
        total_income: {
            type: Sequelize.DOUBLE,
            defaultValue: 0
        },
        // basic_condition: {
        //     type: Sequelize.INTEGER
        // }
    },
    {
        freezeTableName: true,
    }
);
plt_estate_activity_detail.belongsTo(hrd_employee, { foreignKey: "employee_id" });
// plt_block_master.belongsTo(adm_company, { foreignKey: "code_company" });
// plt_block_master.belongsTo(adm_activity_type, { foreignKey: "block_status" });
// fat_asset_subtype.hasMany(fat_asset_subtype_translations, { foreignKey: "code_asset_subtype" });
module.exports = plt_estate_activity_detail;
