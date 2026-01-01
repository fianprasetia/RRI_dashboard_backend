const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const fat_coa = require("./fat_coa");
const fat_account_bank = koneksi.define(
    "fat_account_bank",
    {
        bank_account_number: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
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
        bank: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        branch: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        currencies: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        // koneksi,
        // modelName: 'fat_account_bank',
        // indexes: [
        //     {
        //         unique: true,
        //         fields: ['code_company', 'period'],
        //     },
        // ],
    }
);
fat_account_bank.belongsTo(adm_company, { foreignKey: "code_company" });
fat_account_bank.belongsTo(fat_coa, { foreignKey: "code_coa" });
// adm_period.belongsTo(adm_organization, { onDelete: 'RESTRICT',onUpdate: 'RESTRICT',  foreignKey: "sub_company" });
module.exports = fat_account_bank;
