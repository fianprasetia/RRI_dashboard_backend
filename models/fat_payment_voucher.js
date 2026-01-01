const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_partners = require("./log_partners")
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company")
const fat_payment_voucher_type = require("./fat_payment_voucher_type")
const fat_payment_voucher_detail = require("./fat_payment_voucher_detail");
const fat_payment_voucher = koneksi.define(
    "fat_payment_voucher",
    {
        code_payment_voucher: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        code_payment_voucher_type: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_payment_voucher_type",
                key: "code_payment_voucher_type"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        no_transaction: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        no_invoice: {
            type: Sequelize.STRING,
            allowNull: true,
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
        date_create: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        code_partners: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_partners",
                key: "code_partners"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        exchange_rate: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        due_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        tax_invoice_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        tax_invoice_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        invoice_amount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
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
            comment: "0. Create, 1. Posting, 2.Paid, 3. Delete"
        },
    },
    {
        freezeTableName: true,
    }
);
fat_payment_voucher.hasMany(fat_payment_voucher_detail, { foreignKey: "code_payment_voucher", as: "details" });
fat_payment_voucher.belongsTo(log_partners, { foreignKey: "code_partners" });
fat_payment_voucher.belongsTo(hrd_employee, { foreignKey: "create_by", as: "employeeCreate" });
fat_payment_voucher.belongsTo(hrd_employee, { foreignKey: "update_by", as: "employeeUpdate" });
fat_payment_voucher.belongsTo(adm_company, { foreignKey: "code_company", as: "company" });
fat_payment_voucher.belongsTo(adm_company, { foreignKey: "worksite" });
fat_payment_voucher.belongsTo(fat_payment_voucher_type, { foreignKey: "code_payment_voucher_type" });
module.exports = fat_payment_voucher;
