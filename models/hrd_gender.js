const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_gender_translations = require("./hrd_gender_translations");
const hrd_gender = koneksi.define(
    "hrd_gender",
    {
        gender_code: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);
hrd_gender.hasMany(hrd_gender_translations, { foreignKey: "gender_code" });
module.exports = hrd_gender;
