const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const plt_estate_activity_detail = require("./plt_estate_activity_detail")
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company");
const plt_estate_activity_penalty = require("./plt_estate_activity_penalty")
const plt_estate_activity = koneksi.define(
    "plt_estate_activity",
    {
        transaction_no: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        transaction_type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATEONLY,
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
        foreman: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        foreman_1: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        division_clerk: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        loading_clerk: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        update_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        source_type: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            comment: "0.web, 1.mobile"
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            comment: "0. Create, 1. Posting, 2. Delete"
        },
    },
    {
        freezeTableName: true,
    }
);
plt_estate_activity.belongsTo(adm_company, { foreignKey: "code_company" });
plt_estate_activity.belongsTo(adm_company, { foreignKey: "worksite", as: "location" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "foreman", as: "employeeForeman" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "foreman_1", as: "employeeforeman_1" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "division_clerk", as: "employeeDivision" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "loading_clerk", as: "employeeLoading" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "created_by", as: "employeeCreate" });
plt_estate_activity.belongsTo(hrd_employee, { foreignKey: "update_by", as: "employeeUpdate" });
plt_estate_activity.hasMany(plt_estate_activity_detail, { foreignKey: "transaction_no", as: "details" });
plt_estate_activity.hasMany(plt_estate_activity_penalty, { foreignKey: "transaction_no", as: "detailsPenalty" });
module.exports = plt_estate_activity;
