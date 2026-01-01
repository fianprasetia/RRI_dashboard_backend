const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const adm_company = require("./adm_company")
const plt_estate_activity_penalty = koneksi.define(
    "plt_estate_activity_penalty",
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
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_harvest_penalty: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "plt_harvest_penalty_type",
                key: "code_harvest_penalty"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        value: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
    }
);
// plt_estate_activity_penalty.belongsTo(log_item_master, { foreignKey: "code_item" });
// plt_estate_activity_penalty.belongsTo(adm_company, { foreignKey: "warehouse", as: "worksite" });
module.exports = plt_estate_activity_penalty;
