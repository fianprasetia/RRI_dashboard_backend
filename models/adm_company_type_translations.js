const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company_type_translations = koneksi.define(
  "adm_company_type_translations",
  {
    id_code_company_type_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_company_type: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_company_type",
        key: "code_company_type"
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
    modelName: 'adm_company_type_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_company_type', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = adm_company_type_translations;
