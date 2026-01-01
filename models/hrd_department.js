const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_department_translations = require("./hrd_department_translations")
const hrd_department = koneksi.define(
  "hrd_department",
  {
    department_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
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
hrd_department.hasMany(hrd_department_translations, { foreignKey: "department_code" });
module.exports = hrd_department;
