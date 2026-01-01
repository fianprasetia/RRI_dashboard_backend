var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_coa = require("./fat_coa")
const hrd_employee = require("./hrd_employee")
const log_partners = require("./log_partners")
const fat_cash_bank_detail = koneksi.define(
    "fat_cash_bank_detail",
    {
        code_cash_bank: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        code_cash_bank: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_cash_bank",
                key: "code_cash_bank"
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
        code_transactions: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        code_partners: {
            type: Sequelize.STRING,
            allowNull: true,
            references: {
                model: "log_partners",  // Tambahkan reference ke hrd_employee
                key: "code_partners"
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE"
        },
        employee_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",  // Tambahkan reference ke hrd_employee
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE"
        },
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        note: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: "0. Create, 1. Paid, 2. Delete"
        },
    },
    {
        freezeTableName: true,
    }
);
fat_cash_bank_detail.belongsTo(fat_coa, { foreignKey: "code_coa" });
fat_cash_bank_detail.belongsTo(hrd_employee, { foreignKey: "employee_id" });
fat_cash_bank_detail.belongsTo(log_partners, { foreignKey: "code_partners" });
module.exports = fat_cash_bank_detail;
