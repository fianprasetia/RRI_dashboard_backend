const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_marital_translations = require("./hrd_employee_marital_translations")
const hrd_employee_marital = koneksi.define(
  "hrd_employee_marital",
  {
    marital_code: {
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
hrd_employee_marital.hasMany(hrd_employee_marital_translations, { foreignKey: "marital_code" });

module.exports = hrd_employee_marital;
