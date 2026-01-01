const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_education_translations = require("./hrd_education_translations")
const hrd_education = koneksi.define(
  "hrd_education",
  {
    code_education: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
hrd_education.hasMany(hrd_education_translations, { foreignKey: "code_education" });
module.exports = hrd_education;
