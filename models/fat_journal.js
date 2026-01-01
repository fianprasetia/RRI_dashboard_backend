const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const fat_coa_translations = require("./fat_coa_translations")
const fat_coa = require("./fat_coa")
const adm_company = require("./adm_company")
const fat_journal = koneksi.define(
    "fat_journal",
    {
        journal_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code_journal: {
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
        sequence_number: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        dk_code: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        reference_code: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        code_partners: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        code_item: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);
fat_journal.belongsTo(fat_coa, { foreignKey: "code_coa" });
fat_journal.belongsTo(adm_company, { foreignKey: "code_company" });
module.exports = fat_journal;
