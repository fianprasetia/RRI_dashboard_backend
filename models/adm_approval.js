const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_approval_type = require("./adm_approval_type");
const adm_company = require("./adm_company");
const hrd_employee = require("./hrd_employee");
const adm_approval = koneksi.define(
    "adm_approval",
    {
        id_approval: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        type_approval: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_approval_type",
                key: "type_approval"
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
        level_approval: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        koneksi,
        modelName: 'adm_approval',
        indexes: [
            {
                unique: true,
                fields: ['type_approval', 'code_company', 'employee_id'],
            },
        ],
    }
);
adm_approval.belongsTo(adm_approval_type, { foreignKey: "type_approval" });
adm_approval.belongsTo(adm_company, { foreignKey: "code_company" });
adm_approval.belongsTo(hrd_employee, { foreignKey: "employee_id" });
module.exports = adm_approval;