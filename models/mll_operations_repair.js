const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const mll_operations_repair = koneksi.define(
    "mll_operations_repair",
    {
        transaction_no: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "mll_operations",
                key: "transaction_no"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        station: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        machine: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        on_repair_time: {
            type: Sequelize.TIME,
            allowNull: false,
        },
        off_repair_time: {
            type: Sequelize.TIME,
            allowNull: false,
        },
        total_repair_time: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        presure_start: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        presure_end: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);
mll_operations_repair.belongsTo(adm_company, { foreignKey: "station", as: "factorystation" });
mll_operations_repair.belongsTo(adm_company, { foreignKey: "machine", as: "factorymachine" });
module.exports = mll_operations_repair;
