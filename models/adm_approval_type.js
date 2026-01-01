const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_approval_type_translations = require("./adm_approval_type_translations");
const adm_approval_type = koneksi.define(
  "adm_approval_type",
  {
    type_approval: {
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
adm_approval_type.hasMany(adm_approval_type_translations, { foreignKey: "type_approval" });
module.exports = adm_approval_type;