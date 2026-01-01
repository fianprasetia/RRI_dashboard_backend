const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_content = koneksi.define(
  "adm_content",
  {
    content_code: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);
module.exports = adm_content;
