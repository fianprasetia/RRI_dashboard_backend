const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_catu_translations = koneksi.define(
  "hrd_catu_translations",
  {
    id_catu_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    catu_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_catu",
        key: "catu_code"
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
    modelName: 'hrd_catu_translations',
    indexes: [
      {
        unique: true,
        fields: ['catu_code', 'language_code'],
      },
    ],
  }
);
module.exports = hrd_catu_translations;
