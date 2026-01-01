const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee")
const log_goods_receipt = require("./log_goods_receipt")
const log_goods_receipt_approval = koneksi.define(
    "log_goods_receipt_approval",
    {
        code_goods_receipt: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_goods_receipt",
                key: "code_goods_receipt"
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
        date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        level_approval: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment:"0.Create, 1. Request, 2. Approve, 3.Reject"
        },
    },
    {
        freezeTableName: true,
    }
);
log_goods_receipt_approval.belongsTo(hrd_employee, { foreignKey: "employee_id" });
// log_goods_receipt_approval.hasOne(log_goods_receipt, { foreignKey: "code_goods_receipt" });
module.exports = log_goods_receipt_approval;