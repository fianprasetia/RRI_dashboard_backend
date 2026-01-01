const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const log_purchase_order_detail = koneksi.define(
    "log_purchase_order_detail",
    {
        code_purchase_order_detail: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement:true
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
        qty: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        qty_received: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            comment: "Jumlah barang yang sudah diterima"
        },
        price: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0.Request, 1. Release, 2.Good Recieve, 3.payment, 4.reject"
        },
    },
    {
        freezeTableName: true,
    }
);
log_purchase_order_detail.belongsTo(log_item_master, { foreignKey: "code_item" });
// log_item_master.hasMany(log_purchase_order_detail, {foreignKey: 'code_item'});
module.exports = log_purchase_order_detail;