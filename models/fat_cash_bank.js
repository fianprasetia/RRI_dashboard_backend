var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company")
const fat_cash_bank_detail = require("./fat_cash_bank_detail")
const fat_coa = require("./fat_coa")
const fat_account_bank = require("./fat_account_bank")
const hrd_employee = require("./hrd_employee")
const fat_cash_bank = koneksi.define(
    "fat_cash_bank",
    {
        code_cash_bank: {
            type: Sequelize.STRING,
            allowNull: false,
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
        bank_account_number: {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: "fat_account_bank",
                key: "bank_account_number"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        date_create: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        type_transactions: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        paid_to: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        exchange_rate: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        payment_method: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        payment_method: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        note: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        create_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        update_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
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
fat_cash_bank.hasMany(fat_cash_bank_detail, { foreignKey: "code_cash_bank", as: "details" });
fat_cash_bank.belongsTo(fat_account_bank, { foreignKey: "bank_account_number" });
fat_cash_bank.belongsTo(fat_coa, { foreignKey: "code_coa" });
fat_cash_bank.belongsTo(adm_company, { foreignKey: "code_company" });
fat_cash_bank.belongsTo(adm_company, { foreignKey: "worksite", as: "WorksiteCompany" });
fat_cash_bank.belongsTo(hrd_employee, { foreignKey: "create_by", as: "employeeCreate" });
fat_cash_bank.belongsTo(hrd_employee, { foreignKey: "update_by", as: "employeeUpdate" });
module.exports = fat_cash_bank;
