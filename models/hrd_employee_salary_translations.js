const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_salary_translations = koneksi.define(
  "hrd_employee_salary_translations",
  {
    id_employee_salary_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    employee_salary_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_salary",
        key: "employee_salary_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    language_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_language",
        key: "language_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    translation: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    // koneksi,
    // modelName: 'hrd_employee_salary_translations',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['employee_salary_code', 'language_code'],
    //     // name: 'hrd_employee_salary_code_language_code_unique_index'
    //   },
    // ],
  }
);
module.exports = hrd_employee_salary_translations;
