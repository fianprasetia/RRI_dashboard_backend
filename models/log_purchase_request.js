const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_purchase_request_detail = require("./log_purchase_request_detail")
const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
const log_purchase_request_approval = require("./log_purchase_request_approval")
const log_purchase_request = koneksi.define(
    "log_purchase_request",
    {
        code_purchase_request: {
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
        employee_purchasing: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        date_request: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment:"0.Request, 1. Waiting Approval, 2. Approve, 3. Finding suppliers, 4. create PO (Done), 5.reject, 6.Delete"
        },
    },
    {
        freezeTableName: true,
        indexes: [
          {
            name: "idx_code_company", // Nama index
            fields: ["code_company"], // Kolom yang diindeks
          },
          {
            name: "idx_type", // Nama index
            fields: ["type"], // Composite index
          },
          {
            name: "idx_employee_id", // Nama index
            fields: ["employee_id"], // Composite index
          },
        ],
    }
);
log_purchase_request.hasMany(log_purchase_request_detail, { foreignKey: "code_purchase_request" });
log_purchase_request.hasMany(log_purchase_request_approval, { foreignKey: "code_purchase_request" });
log_purchase_request.belongsTo(hrd_employee, { foreignKey: "employee_id" });
log_purchase_request.belongsTo(hrd_employee, { foreignKey: "employee_purchasing", as: "employeePurchasing" });
log_purchase_request_approval.belongsTo(log_purchase_request, { foreignKey: "code_purchase_request" });
log_purchase_request.belongsTo(adm_company, { foreignKey: "code_company" });
module.exports = log_purchase_request;