const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee");
const adm_posting_type = require("./adm_posting_type");
const adm_posting = koneksi.define(
    "adm_posting",
    {
        id_posting: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        type_posting: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "adm_posting_type",
                key: "type_posting"
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
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
    }
);
adm_posting.belongsTo(hrd_employee, { foreignKey: "employee_id", as: "employee" });
adm_posting.belongsTo(adm_posting_type, { foreignKey: "type_posting" });
module.exports = adm_posting;