const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_approval_type_translations = koneksi.define(
  "adm_approval_type_translations",
  {
    id_type_approval_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type_approval: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_approval_type",
        key: "type_approval"
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
    modelName: 'adm_approval_type_translations',
    indexes: [
      {
        unique: true,
        fields: ['type_approval', 'language_code'],
      },
    ],
  }
);
module.exports = adm_approval_type_translations;
