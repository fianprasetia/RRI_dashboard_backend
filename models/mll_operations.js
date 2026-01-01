const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const mll_operations_repair = require("./mll_operations_repair")
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company");
const mll_operations = koneksi.define(
    "mll_operations",
    {
        transaction_no: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        mill: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_company",
                key: "code_company"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        work_shift: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        on_duty_time: {
            type: Sequelize.TIME,
            allowNull: false,
        },
        off_duty_time: {
            type: Sequelize.TIME,
            allowNull: false,
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
        assistant: {
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
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        update_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "SET NULL",
            onUpdate: "Cascade"
        },
        total_working_hours: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        total_repair_time: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        number_of_cages: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        processed_ffb: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "0. Created, 1. Posting, 2.Delete"
        },
    },
    {
        freezeTableName: true,
    }
);
mll_operations.belongsTo(adm_company, { foreignKey: "mill", as: "factory" });
mll_operations.belongsTo(hrd_employee, { foreignKey: "foreman", as: "employeeForeman" });
mll_operations.belongsTo(hrd_employee, { foreignKey: "assistant", as: "employeeAssistant" });
mll_operations.belongsTo(hrd_employee, { foreignKey: "created_by", as: "employeeCreate" });
mll_operations.belongsTo(hrd_employee, { foreignKey: "update_by", as: "employeeUpdate" });
mll_operations.hasMany(mll_operations_repair, { foreignKey: "transaction_no", as: "details" });
module.exports = mll_operations;
