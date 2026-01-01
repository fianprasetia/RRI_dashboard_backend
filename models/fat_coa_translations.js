const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_coa_translations = koneksi.define(
  "fat_coa_translations",
  {
    id_coa_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_coa: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "fat_coa",
        key: "code_coa"
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
    modelName: 'fat_coa_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_coa', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = fat_coa_translations;
