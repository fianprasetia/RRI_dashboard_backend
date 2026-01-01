const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const adm_attendance_machine = koneksi.define(
    "adm_attendance_machine",
    {
        id_attendance_machine: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
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
        location: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        ip_address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        port: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        koneksi,
        modelName: 'attendance_machine',
        indexes: [
            {
                unique: true,
                fields: ['code_company', 'ip_address'],
            },
        ],
    }
);
adm_attendance_machine.belongsTo(adm_company, { foreignKey: "code_company" });
module.exports = adm_attendance_machine;