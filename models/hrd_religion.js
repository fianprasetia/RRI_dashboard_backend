const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_religion_translations = require("./hrd_religion_translations")
const hrd_religion = koneksi.define(
  "hrd_religion",
  {
    code_religion: {
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
hrd_religion.hasMany(hrd_religion_translations, { foreignKey: "code_religion" });
module.exports = hrd_religion;
