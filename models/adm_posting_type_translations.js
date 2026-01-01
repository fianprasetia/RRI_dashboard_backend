const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_posting_type_translations = koneksi.define(
  "adm_posting_type_translations",
  {
    id_type_posting_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type_posting: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_posting_type",
        key: "type_posting"
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
    modelName: 'adm_posting_type_translations',
    indexes: [
      {
        unique: true,
        fields: ['type_posting', 'language_code'],
      },
    ],
  }
);
module.exports = adm_posting_type_translations;
