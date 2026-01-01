const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_grade_translations = require("./hrd_grade_translations")
const hrd_grade = koneksi.define(
  "hrd_grade",
  {
    grade_code: {
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
hrd_grade.hasMany(hrd_grade_translations, { foreignKey: "grade_code" });
module.exports = hrd_grade;
