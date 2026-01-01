const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_transaction_unposting_translations = koneksi.define(
    "fat_transaction_unposting_translations",
    {
        id_transaction_unposting_translations: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code_transaction_unposting: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_transaction_unposting",
                key: "code_transaction_unposting"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        language_code: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_language",
                key: "language_code"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        translation: {
            type: Sequelize.STRING,
            allowNull: false,
        },

    },
    {
        freezeTableName: true,
        // koneksi,
        // modelName: 'fat_transaction_unposting_translations',
        // indexes: [
        //   {
        //     unique: true,
        //     fields: ['code_transaction_unposting', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
        //   },
        // ],
    }
);
module.exports = fat_transaction_unposting_translations;
