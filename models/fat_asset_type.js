const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_asset_type_translations = require("./fat_asset_type_translations")
const fat_coa = require("./fat_coa")
const fat_asset_type = koneksi.define(
    "fat_asset_type",
    {
        code_asset_type: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        code_coa_depreciation: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_coa",
                key: "code_coa"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_coa_accumulated: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "fat_coa",
                key: "code_coa"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        // depreciation_methods: {
        //     type: Sequelize.STRING,
        //     allowNull: false,
        // },
    },
    {
        freezeTableName: true,
    }
);
fat_asset_type.hasMany(fat_asset_type_translations, { foreignKey: "code_asset_type" });
fat_asset_type.belongsTo(fat_coa, { foreignKey: "code_coa_depreciation", as: "depreciation" });
fat_asset_type.belongsTo(fat_coa, { foreignKey: "code_coa_accumulated", as: "accumulated" });
module.exports = fat_asset_type;
