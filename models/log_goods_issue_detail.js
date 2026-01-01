const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const adm_activity = require("./adm_activity")
const log_goods_issue_detail = koneksi.define(
    "log_goods_issue_detail",
    {
        code_goods_issue_detail: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code_goods_issue: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "log_goods_issue",
                key: "code_goods_issue"
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
       outgoing_price: {
             type: Sequelize.DOUBLE,
             allowNull: true,
             defaultValue: 0,
             comment:"harga keluar"
           },
        worksite: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        asset_code: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        code_activity: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
                model: "adm_activity",
                key: "code_activity"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
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
log_goods_issue_detail.belongsTo(log_item_master, { foreignKey: "code_item" });
log_goods_issue_detail.belongsTo(adm_activity, { foreignKey: "code_activity" });
module.exports = log_goods_issue_detail;