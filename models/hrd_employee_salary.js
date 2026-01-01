const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_salary_translations = require("./hrd_employee_salary_translations")
const hrd_employee_salary = koneksi.define(
  "hrd_employee_salary",
  {
    employee_salary_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
hrd_employee_salary.hasOne(hrd_employee_salary_translations, { foreignKey: "employee_salary_code" });
// hrd_employee_salary_translations.belongsTo(hrd_employee_salary, { foreignKey: "employee_salary_code" });
module.exports = hrd_employee_salary;
