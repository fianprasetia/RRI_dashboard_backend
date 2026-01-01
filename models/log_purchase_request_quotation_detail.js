const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const log_purchase_request_quotation_detail = koneksi.define(
    "log_purchase_request_quotation_detail",
    {
        code_purchase_request_quotation_detail: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement:true
        },
        code_purchase_request_quotation: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_purchase_request_quotation",
                key: "code_purchase_request_quotation"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_item: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "log_item_master",
                key: "code_item"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        qty: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        price: {
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
    }
);
log_purchase_request_quotation_detail.belongsTo(log_item_master, { foreignKey: "code_item" });
// log_item_master.hasMany(log_purchase_request_quotation_detail, {foreignKey: 'code_item'});
module.exports = log_purchase_request_quotation_detail;