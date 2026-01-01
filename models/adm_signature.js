const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee");
const adm_signature = koneksi.define(
    "adm_signature",
    {
        employee_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "hrd_employee",
                key: "employee_id"
            },
            onDelete: "Cascade",
            onUpdate: "Cascade"
        },
        photo: {
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
    }
);
adm_signature.belongsTo(hrd_employee, { foreignKey: "employee_id"});
module.exports = adm_signature;