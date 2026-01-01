const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_job_title = require("./hrd_job_title")
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company")
const hrd_employee_type = require("./hrd_employee_type")
const hrd_basic_salary = koneksi.define(
    "hrd_basic_salary",
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
        employee_type_code: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_employee_type",
                key: "employee_type_code"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
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
        id_job_title: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "hrd_job_title",
                key: "id_job_title"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        nominal: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        period: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        koneksi,
        modelName: 'hrd_basic_salary',
        indexes: [
            {
                unique: true,
                fields: ['employee_id', 'period'],
                name: 'unique_hrd_basic_salary'
            },
        ],
    }
);
hrd_basic_salary.belongsTo(adm_company, { foreignKey: "code_company" });
hrd_basic_salary.belongsTo(hrd_employee_type, { foreignKey: "employee_type_code" });
hrd_basic_salary.belongsTo(hrd_employee, { foreignKey: "employee_id" });
hrd_basic_salary.belongsTo(hrd_job_title, { foreignKey: "id_job_title" });
module.exports = hrd_basic_salary;
