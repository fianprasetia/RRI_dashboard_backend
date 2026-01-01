const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
const plt_harvest_incentive = koneksi.define(
    "plt_harvest_incentive",
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
        harvest_day: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0.workday, 1.holiday"
        },
        start_bjr: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        end_bjr: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        harvest_basis_ffb: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        harvest_basis_i_ffb: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        harvest_basis_ii_ffb: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        basis_bonus: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
        extra_basis_bonus: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
        extra_basis_bonus_i: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
        extra_basis_bonus_ii: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
        },
        loose_fruit_bonus: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
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
    },
    {
        freezeTableName: true,
    }
);
plt_harvest_incentive.belongsTo(adm_company, { foreignKey: "code_company" });
plt_harvest_incentive.belongsTo(hrd_employee, { foreignKey: "create_by" });
module.exports = plt_harvest_incentive;
