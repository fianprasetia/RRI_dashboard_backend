const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_menu_mobile_translations = koneksi.define(
  "adm_menu_mobile_translations",
  {
    id_menu_mobile_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_menu: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "adm_menu_mobile",
        key: "id_menu"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    language_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_language",
        key: "language_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    translation: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    koneksi,
    modelName: 'adm_menu_mobile_translations',
    indexes: [
      {
        unique: true,
        fields: ['id_menu', 'language_code'],
      },
    ],
  }
);
module.exports = adm_menu_mobile_translations;
