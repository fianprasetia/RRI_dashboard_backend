const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_asset_subtype_translations = require("./fat_asset_subtype_translations")
const fat_asset_type = require("./fat_asset_type")
// const fat_coa = require("./fat_coa")
const fat_asset_subtype = koneksi.define(
    "fat_asset_subtype",
    {
        code_asset_subtype: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        code_asset_type: {
            type: Sequelize.STRING,
            references: {
                model: "fat_asset_type",
                key: "code_asset_type"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        useful_life: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
fat_asset_subtype.hasMany(fat_asset_subtype_translations, { foreignKey: "code_asset_subtype" });
fat_asset_subtype.belongsTo(fat_asset_type, { foreignKey: "code_asset_type" });
// fat_asset_subtype.belongsTo(fat_coa, { foreignKey: "code_coa_accumulated ", as: "assetFix" });
module.exports = fat_asset_subtype;
