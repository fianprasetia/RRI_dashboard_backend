const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
const adm_signature = require("./adm_signature")
const log_goods_issue_detail = require("./log_goods_issue_detail")
const log_goods_issue_approval = require("./log_goods_issue_approval")
const log_goods_issue = koneksi.define(
    "log_goods_issue",
    {
        code_goods_issue: {
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
        warehouse: {
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
        request_by: {
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
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        no_reference: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0.Create, 1.Request, 2. approve, 3.reject, 4.delete"
        },
    },
    {
        freezeTableName: true,
    }
);
log_goods_issue.hasMany(log_goods_issue_detail, { foreignKey: "code_goods_issue", as: "details" });
log_goods_issue.hasMany(log_goods_issue_approval, { foreignKey: "code_goods_issue" });
log_goods_issue_approval.belongsTo(log_goods_issue, { foreignKey: "code_goods_issue" });
log_goods_issue.belongsTo(adm_company, { foreignKey: "code_company" });
log_goods_issue.belongsTo(hrd_employee, { foreignKey: "employee_id", as: "employeeWarehouse" });
log_goods_issue.belongsTo(hrd_employee, { foreignKey: "request_by", as: "employeeRequest" });
log_goods_issue.belongsTo(adm_signature, { foreignKey: "employee_id", as: "employeeSignature" });
module.exports = log_goods_issue;