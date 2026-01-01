const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_coa = require("./fat_coa")
const fat_balance_monthly = koneksi.define(
    "fat_balance_monthly",
    {
        id_balance_monthly: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        worksite: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_coa: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_coa",
                key: "code_coa"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        period_date: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        opening_balance: {
            type: Sequelize.DOUBLE,
            allowNull: true,
            defaultValue: 0,
        },
        debit: {
            type: Sequelize.DOUBLE,
            allowNull: true,
            defaultValue: 0,
        },
        credit: {
            type: Sequelize.DOUBLE,
            allowNull: true,
            defaultValue: 0,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "0. Open, 1. CLose"
        },
    },
    {
        freezeTableName: true,
    }
);
fat_balance_monthly.belongsTo(fat_coa, { foreignKey: "code_coa" });
module.exports = fat_balance_monthly;
