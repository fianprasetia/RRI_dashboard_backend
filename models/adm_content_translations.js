const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_content_translations = koneksi.define(
  "adm_content_translations",
  {
    id_content_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    content_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_content",
        key: "content_code"
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
    modelName: 'adm_content_translations',
    indexes: [
      {
        unique: true,
        fields: ['content_code', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = adm_content_translations;
