const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_term_of_payment_translations = require("./log_term_of_payment_translations")
const log_term_of_payment = koneksi.define(
    "log_term_of_payment",
    {
        code_term_of_payment: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement:true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
log_term_of_payment.hasOne(log_term_of_payment_translations, { foreignKey: "code_term_of_payment" });
module.exports = log_term_of_payment;