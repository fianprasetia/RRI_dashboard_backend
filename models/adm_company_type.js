const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company_type_translations = require("./adm_company_type_translations")
const adm_company_type = koneksi.define(
  "adm_company_type",
  {
    code_company_type: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey:true
    },
  },
  {
    freezeTableName: true,
  }
);
adm_company_type.hasMany(adm_company_type_translations, { foreignKey: "code_company_type" });
module.exports = adm_company_type;
