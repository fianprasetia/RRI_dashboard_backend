const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_tax_translations =require ("./hrd_employee_tax_translations")
const hrd_employee_tax = koneksi.define(
  "hrd_employee_tax",
  {
    employee_tax_code: {
      type: Sequelize.STRING,
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
hrd_employee_tax.hasMany(hrd_employee_tax_translations, { foreignKey: "employee_tax_code" });
module.exports = hrd_employee_tax;
