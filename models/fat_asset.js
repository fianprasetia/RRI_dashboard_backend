const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const adm_company = require("./adm_company")
const fat_asset_type = require("./fat_asset_type")
const fat_asset = koneksi.define(
    "fat_asset",
    {
        asset_code: {
            type: Sequelize.STRING,
            allowNull: true,
            // primaryKey: true,
        },
        worksite: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        asset_location: {
            type: Sequelize.STRING,
            allowNull: true,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_asset_type: {
            type: Sequelize.STRING,
            allowNull: true,
            references: {
                model: "fat_asset_type",
                key: "code_asset_type"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_asset_subtype: {
            type: Sequelize.STRING,
            allowNull: true,
            references: {
                model: "fat_asset_subtype",
                key: "code_asset_subtype"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        code_item: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "log_item_master",
                key: "code_item"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        acquisition_year: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "tahun perolehan"
        },
        depreciation_start_month: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "awal bulan penyusutan"
        },
        // description: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // },
        procurement_document: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        payment_ref: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        project: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        historical_cost: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            comment: "harga perolehan"
        },
        depreciation_value_monthly: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            comment: "nominal penyusutannya perbulan"
        },
        depreciation_period_months: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "jumlah bulan penyusutan"
        },
        note: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        leasing_status: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment:"0.Non Leasing 1. leasing"
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0 Non Active, 1. Active, 2 Damaged, 3, Retired Asset , 4 lost"
        },
    },
    {
        freezeTableName: true,
    }
);
fat_asset.belongsTo(log_item_master, { foreignKey: "code_item" });
fat_asset.belongsTo(fat_asset_type, { foreignKey: "code_asset_type" });
fat_asset.belongsTo(adm_company, { foreignKey: "worksite", as: "company"});
// fat_asset_type.belongsTo(fat_coa, { foreignKey: "code_coa_depreciation", as: "depreciation" });
// fat_asset_type.belongsTo(fat_coa, { foreignKey: "code_coa_asset_fix", as: "assetFix" });
module.exports = fat_asset;
