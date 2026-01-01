const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const plt_seed_type = koneksi.define(
    "plt_seed_type",
    {
        seed_type: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        freezeTableName: true,
    }
);
module.exports = plt_seed_type;
