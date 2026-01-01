const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company")
const adm_company_employee_code = koneksi.define(
  "adm_company_employee_code",
  {
    code_company: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "adm_company",
        key: "code_company"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    employee_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
adm_company_employee_code.hasMany(adm_company, { foreignKey: "code_company" });
module.exports = adm_company_employee_code;
