const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_transaction_unposting_translations = require("./fat_transaction_unposting_translations")
const fat_transaction_unposting = koneksi.define(
    "fat_transaction_unposting",
    {
        code_transaction_unposting: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
fat_transaction_unposting.hasMany(fat_transaction_unposting_translations, { foreignKey: "code_transaction_unposting", as: 'translations'});
module.exports = fat_transaction_unposting;
