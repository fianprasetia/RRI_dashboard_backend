var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const hrd_employee = require("./hrd_employee");
const adm_user_login = koneksi.define(
    "adm_user_login",
    {
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        employee_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
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
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        old_password: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        access_web: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        access_mobile: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        change_password: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
adm_user_login.belongsTo(adm_company, { foreignKey: "code_company" });
adm_user_login.belongsTo(hrd_employee, { foreignKey: "employee_id" });
module.exports = adm_user_login;
