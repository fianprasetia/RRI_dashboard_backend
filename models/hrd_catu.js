const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_catu_translations = require("./hrd_catu_translations")
const hrd_catu = koneksi.define(
  "hrd_catu",
  {
    catu_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey:true
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
hrd_catu.hasMany(hrd_catu_translations, { foreignKey: "catu_code" });
module.exports = hrd_catu;
