const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_posting_type_translations = require("./adm_posting_type_translations");
const adm_posting_type = koneksi.define(
  "adm_posting_type",
  {
    type_posting: {
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
adm_posting_type.hasMany(adm_posting_type_translations, { foreignKey: "type_posting" });
module.exports = adm_posting_type;