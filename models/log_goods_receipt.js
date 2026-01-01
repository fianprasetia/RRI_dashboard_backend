const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const log_purchase_order_detail = require("./log_purchase_order_detail")
// const log_partners = require("./log_partners")
// const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
// const log_term_of_payment = require("./log_term_of_payment")
const log_purchase_order = require("./log_purchase_order")
const log_goods_receipt_detail = require("./log_goods_receipt_detail")
const log_goods_receipt_approval = require("./log_goods_receipt_approval")
const adm_signature = require("./adm_signature");
const log_goods_receipt = koneksi.define(
    "log_goods_receipt",
    {
        code_goods_receipt: {
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
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_purchase_order: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_purchase_order",
                key: "code_purchase_order"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        invoice:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        shipping:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        type:{
            type:Sequelize.STRING,
            allowNull:false,
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
log_goods_receipt.hasMany(log_goods_receipt_detail, { foreignKey: "code_goods_receipt", as: "details" });
log_goods_receipt.hasMany(log_goods_receipt_approval, { foreignKey: "code_goods_receipt" });
log_goods_receipt_approval.belongsTo(log_goods_receipt, { foreignKey: "code_goods_receipt" });
log_goods_receipt.belongsTo(log_purchase_order, { foreignKey: "code_purchase_order" });
log_goods_receipt.belongsTo(hrd_employee, { foreignKey: "employee_id", as: "employeeWarehouse" });
log_goods_receipt.belongsTo(adm_signature, { foreignKey: "employee_id", as: "employeeSignature" });
// log_purchase_order.belongsTo(log_partners, { foreignKey: "code_partners" });
// log_purchase_order.belongsTo(adm_company, { foreignKey: "code_company" });
// log_purchase_order.belongsTo(adm_company, { foreignKey: "worksite", as: "worksiteCompany" });
// log_purchase_order.belongsTo(hrd_employee, { foreignKey: "employee_approval", as: "employeeApproval" });
// log_purchase_order.belongsTo(log_term_of_payment, { foreignKey: "code_term_of_payment" });
module.exports = log_goods_receipt;