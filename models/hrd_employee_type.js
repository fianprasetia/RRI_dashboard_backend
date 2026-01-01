const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_type_translations = require("./hrd_employee_type_translations")
const hrd_employee_type = koneksi.define(
  "hrd_employee_type",
  {
    employee_type_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
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
hrd_employee_type.hasMany(hrd_employee_type_translations, { foreignKey: "employee_type_code" });
module.exports = hrd_employee_type;
