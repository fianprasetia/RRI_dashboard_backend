const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_status_translations = require("./hrd_employee_status_translations")
const hrd_employee_status = koneksi.define(
  "hrd_employee_status",
  {
    code_employee_status: {
      type: Sequelize.INTEGER,
      autoIncrement:true,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
hrd_employee_status.hasOne(hrd_employee_status_translations, { foreignKey: "code_employee_status" });
module.exports = hrd_employee_status;
