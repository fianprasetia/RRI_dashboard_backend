const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const fat_asset_subtype_translations = require("./fat_asset_subtype_translations")
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company")
const adm_activity_type = require("./adm_activity_type")
const plt_block_master = koneksi.define(
    "plt_block_master",
    {
        code_company: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        create_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        block_status: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Status Blok",
            references: {
                model: "adm_activity_type",
                key: "code_activity_type"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        planting_year: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Tahun Tanam'
        },
        tree_class: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Kelas Pohon"
        },
        planted_area: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            comment: "Luas Planted"
        },
        unplanted_area: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            comment: "Luas unPlanted"
        },
        number_of_trees: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "Jumlah Pokok"
        },
        start_harvest: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Mulai Panen"
        },
        soil_code: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Kode Tanah"
        },
        soil_classification: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Klasifikasi Tanah"
        },
        topography: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Topografi"
        },
        nucleus_plasma: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Inti / Plasma"
        },
        seed_type: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: "Jenis Bibit"
        },
    },
    {
        freezeTableName: true,
    }
);
plt_block_master.belongsTo(adm_company, { foreignKey: "code_company" });
plt_block_master.belongsTo(hrd_employee, { foreignKey: "create_by" });
plt_block_master.belongsTo(adm_activity_type, { foreignKey: "block_status" });
// fat_asset_subtype.hasMany(fat_asset_subtype_translations, { foreignKey: "code_asset_subtype" });
module.exports = plt_block_master;
