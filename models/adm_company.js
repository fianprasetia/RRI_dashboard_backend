var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company_type = require("./adm_company_type")
const adm_company = koneksi.define(
    "adm_company",
    {
        code_company: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        code_company_type: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company_type",
                key: "code_company_type"
              },
              onDelete: "Cascade",
              onUpdate: "Cascade"
        },
        parent_code: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        level: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true,//true
        },
        province: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        phone_number: {
            type: Sequelize.STRING,
            allowNull: true,//true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,//true
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        zip_code: {
            type: Sequelize.STRING,
            allowNull: true,//true
        },
        tax_identification_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        capacity: {
            type: Sequelize.DOUBLE,
            allowNull: true,//true
        },
    },
    {
        freezeTableName: true,
    }
);
adm_company.belongsTo(adm_company_type, { foreignKey: "code_company_type" });
module.exports = adm_company;
