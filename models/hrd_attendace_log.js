const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee");
const hrd_attendace_log = koneksi.define(
  "hrd_attendace_log",
  {
    id_hrd_attendace: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
  },
    employee_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // primaryKey: true,
      references: {
          model: "hrd_employee",
          key: "employee_id"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
  },
    record_time: {
      type: Sequelize.DATE,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    freezeTableName: true,
  }
);
hrd_attendace_log.hasOne(hrd_employee, { foreignKey: "employee_id" });
module.exports = hrd_attendace_log;
