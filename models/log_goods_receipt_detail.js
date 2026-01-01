const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const log_goods_receipt_detail = koneksi.define(
    "log_goods_receipt_detail",
    {
        code_goods_receipt__detail: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
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
        original_price: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        discounted_price: {
            type: Sequelize.DOUBLE,
            allowNull: false,
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
log_goods_receipt_detail.belongsTo(log_item_master, { foreignKey: "code_item" });
// log_item_master.hasMany(log_purchase_order_detail, {foreignKey: 'code_item'});
module.exports = log_goods_receipt_detail;