const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_purchase_request_quotation_detail = require("./log_purchase_request_quotation_detail")
const log_partners = require("./log_partners")
const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
const log_term_of_payment = require("./log_term_of_payment")
const log_receiving_locations = require("./log_receiving_locations")
const log_purchase_request = require("./log_purchase_request")
const log_purchase_request_quotation = koneksi.define(
    "log_purchase_request_quotation",
    {
        code_purchase_request_quotation: {
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
        code_term_of_payment: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "log_term_of_payment",
                key: "code_term_of_payment"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        id_receiving_locations: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "log_receiving_locations",
                key: "id_receiving_locations"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        date_request: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        date_delivery: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        exchange_rate: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        subtotal: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        discount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        shipping_cost: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        vat: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        grand_total: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0.Request, 1. Create PO, 2.Delete"
        },
    },
    {
        freezeTableName: true,
        indexes: [
            {
                name: "idx_code_purchase_request", // Nama index
                fields: ["code_purchase_request"], // Kolom yang diindeks
            },
            {
                name: "idx_code_purchase_request_quotation", // Nama index
                fields: ["code_purchase_request_quotation"], // Composite index
            },
        ],
    }
);
log_purchase_request_quotation.hasMany(log_purchase_request_quotation_detail, { foreignKey: "code_purchase_request_quotation", as: "details" });
log_purchase_request_quotation.belongsTo(log_purchase_request, { foreignKey: "code_purchase_request" });
log_purchase_request_quotation_detail.belongsTo(log_purchase_request_quotation, { foreignKey: 'code_purchase_request_quotation' });
log_purchase_request_quotation.belongsTo(log_partners, { foreignKey: "code_partners" });
log_purchase_request_quotation.belongsTo(adm_company, { foreignKey: "code_company" });
log_purchase_request_quotation.belongsTo(hrd_employee, { foreignKey: "employee_purchasing", as: "employeePurchasing" });
log_purchase_request_quotation.belongsTo(log_term_of_payment, { foreignKey: "code_term_of_payment" });
log_purchase_request_quotation.belongsTo(log_receiving_locations, { foreignKey: "id_receiving_locations" });
module.exports = log_purchase_request_quotation;