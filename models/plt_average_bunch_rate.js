const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const fat_asset_subtype_translations = require("./fat_asset_subtype_translations")
// const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company")
// const adm_activity_type = require("./adm_activity_type")
const plt_average_bunch_rate = koneksi.define(
    "plt_average_bunch_rate",
    {
        division: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        block: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        estate: {
            type: Sequelize.STRING,
            allowNull: true,
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
        average_bunch_rate: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
plt_average_bunch_rate.belongsTo(adm_company, { foreignKey: "division" });
// plt_block_master.belongsTo(hrd_employee, { foreignKey: "create_by" });
// plt_block_master.belongsTo(adm_activity_type, { foreignKey: "block_status" });
// fat_asset_subtype.hasMany(fat_asset_subtype_translations, { foreignKey: "code_asset_subtype" });
module.exports = plt_average_bunch_rate;
