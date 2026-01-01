const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_partners_type = require("./log_partners_type")
const log_partners = koneksi.define(
    "log_partners",
    {
        code_partners_type: {
            type: Sequelize.STRING,
            allowNull: false,

            references: {
                model: "log_partners_type",
                key: "code_partners_type"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_partners: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true
        },
        contact_person: {
            type: Sequelize.STRING,
            allowNull: true
        },
        tax_id: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        bank_name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        bank_account: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
log_partners.belongsTo(log_partners_type, { foreignKey: "code_partners_type" });
module.exports = log_partners;