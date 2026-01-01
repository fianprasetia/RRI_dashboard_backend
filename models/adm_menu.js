const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_menu_translations = require("./adm_menu_translations");
const adm_menu = koneksi.define(
  "adm_menu",
  {
    id_menu: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    parent_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    page: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    icon: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    no_ordinal: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

  },
  {
    freezeTableName: true,
  }
);
adm_menu.hasMany(adm_menu_translations, { foreignKey: "id_menu" });
module.exports = adm_menu;
