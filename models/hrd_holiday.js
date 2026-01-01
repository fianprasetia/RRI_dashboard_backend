const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_holiday = koneksi.define(
    "hrd_holiday",
    {
        period: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
module.exports = hrd_holiday;
