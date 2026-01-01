const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const plt_harvest_penalty_type_translations = require("./plt_harvest_penalty_type_translations")
const plt_harvest_penalty_type = koneksi.define(
    "plt_harvest_penalty_type",
    {
        code_harvest_penalty: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        descriptions: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        // koneksi,
        // modelName: 'plt_harvest_penalty',
        // indexes: [
        //     {
        //         unique: true,
        //         fields: ['code_harvest_penalty', 'code_company'],
        //     },
        // ],
    }
);
plt_harvest_penalty_type.hasMany(plt_harvest_penalty_type_translations, { foreignKey: "code_harvest_penalty", as: "translations" });
module.exports = plt_harvest_penalty_type;
