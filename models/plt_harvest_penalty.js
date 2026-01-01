const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const plt_harvest_penalty_type = require("./plt_harvest_penalty_type")
const adm_company = require("./adm_company")
const hrd_employee = require("./hrd_employee")
const plt_harvest_penalty = koneksi.define(
    "plt_harvest_penalty",
    {
        code_harvest_penalty: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "plt_harvest_penalty_type",
                key: "code_harvest_penalty"
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
        uom: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        nominal: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        note: {
            type: Sequelize.TEXT,
            allowNull: true,
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
        koneksi,
        modelName: 'plt_harvest_penalty',
        indexes: [
            {
                unique: true,
                fields: ['code_harvest_penalty', 'code_company'],
                name: 'unique_plt_harvest_penalty'
            },
        ],
    }
);
plt_harvest_penalty.belongsTo(plt_harvest_penalty_type, { foreignKey: "code_harvest_penalty" });
plt_harvest_penalty.belongsTo(adm_company, { foreignKey: "code_company" });
plt_harvest_penalty.belongsTo(hrd_employee, { foreignKey: "create_by" });
module.exports = plt_harvest_penalty;
