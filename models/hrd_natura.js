const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const hrd_catu = require("./hrd_catu");
const hrd_natura = koneksi.define(
    "hrd_natura",
    {
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
        catu_code: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "hrd_catu",
                key: "catu_code"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        employee: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        husband_wife: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        first_child: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        second_child: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        third_child: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        total_kilogram: {
            type: Sequelize.DOUBLE,
            allowNull: false,
            defaultValue:0
        },
        rice_price_kg: {
            type: Sequelize.DOUBLE,
            allowNull: false,
             defaultValue:0
        },
        rp_day: {
            type: Sequelize.DOUBLE,
            allowNull: false,
             defaultValue:0
        },
    },
    {
        freezeTableName: true,
    }
);
hrd_natura.belongsTo(adm_company, { foreignKey: "code_company" });
hrd_natura.belongsTo(hrd_catu, { foreignKey: "catu_code" });
module.exports = hrd_natura;
