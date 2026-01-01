const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_coa = require("./fat_coa")
const hrd_department = require("./hrd_department")
const fat_payment_voucher_detail = koneksi.define(
    "fat_payment_voucher_detail",
    {
        code_payment_voucher: {
            type: Sequelize.INTEGER,
            references: {
                model: "fat_payment_voucher",
                key: "code_payment_voucher"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        asset_code: {
            type: Sequelize.STRING,
            allowNull: true,
            // // defaultValue: null,
            // references: {
            //     model: "fat_asset",
            //     key: "asset_code"
            // },
            // onDelete: "Cascade",
            // onUpdate: "Cascade"
        },
        department_code: {
            type: Sequelize.STRING,
            allowNull: true,
            // defaultValue: null,
            references: {
                model: "hrd_department",
                key: "department_code"
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
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
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
fat_payment_voucher_detail.belongsTo(fat_coa, { foreignKey: "code_coa" });
fat_payment_voucher_detail.belongsTo(hrd_department, { foreignKey: "department_code" , as: "department"});
module.exports = fat_payment_voucher_detail;
