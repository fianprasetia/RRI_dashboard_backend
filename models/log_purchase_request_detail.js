const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const log_purchase_request_detail = koneksi.define(
    "log_purchase_request_detail",
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
        qty_request: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        qty_actual: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        qty_rfq: {
            type: Sequelize.DOUBLE,
            allowNull: true,
            comment: "Jumlah yang diajukan ke vendor dalam Permintaan Penawaran Pembelian (RFQ)",
            defaultValue:0
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0.Create, 1. Request, 2. Finding suppliers, 3. create PO, 4.reject"
        },
    },
    {
        freezeTableName: true,
    }
);
log_purchase_request_detail.belongsTo(log_item_master, { foreignKey: "code_item" });
module.exports = log_purchase_request_detail;