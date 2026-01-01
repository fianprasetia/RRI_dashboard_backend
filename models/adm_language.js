const koneksi = require("../config/database");
const Sequelize = require("sequelize");
// const adm_auth = require("./adm_auth");
const adm_language = koneksi.define(
  "adm_language",
  {
    language_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
module.exports = adm_language;
