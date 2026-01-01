const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const fat_asset_subtype_translations = require("./fat_asset_subtype_translations")
// const fat_asset_type = require("./fat_asset_type")
const adm_company = require("./adm_company")
const fat_pre_closing_period = koneksi.define(
    "fat_pre_closing_period",
    {
        code_pre_closing_period: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        code_company: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        period: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
fat_pre_closing_period.belongsTo(adm_company, { foreignKey: "code_company" });
// fat_asset_subtype.hasMany(fat_asset_subtype_translations, { foreignKey: "code_asset_subtype" });
// fat_asset_subtype.belongsTo(fat_coa, { foreignKey: "code_coa_accumulated ", as: "assetFix" });
module.exports = fat_pre_closing_period;
