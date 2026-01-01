const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_partners_type_translations = require("./log_partners_type_translations")
const fat_coa = require("./fat_coa")
const log_partners_type = koneksi.define(
    "log_partners_type",
    {
        code_partners_type: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        code_coa: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_coa",
                key: "code_coa"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
    },
    {
        freezeTableName: true,
    }
);
log_partners_type.hasMany(log_partners_type_translations, { foreignKey: "code_partners_type" });
log_partners_type.belongsTo(fat_coa, { foreignKey: "code_coa" });
module.exports = log_partners_type;