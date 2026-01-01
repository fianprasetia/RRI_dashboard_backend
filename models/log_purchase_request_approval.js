const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee")
const log_purchase_request_approval = koneksi.define(
    "log_purchase_request_approval",
    {
        code_purchase_request: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_purchase_request",
                key: "code_purchase_request"
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
log_purchase_request_approval.belongsTo(hrd_employee, { foreignKey: "employee_id" });
module.exports = log_purchase_request_approval;