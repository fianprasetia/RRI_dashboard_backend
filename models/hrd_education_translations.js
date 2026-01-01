const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_education_translations = koneksi.define(
  "hrd_education_translations",
  {
    code_education_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_education: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_education",
        key: "code_education"
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
    modelName: 'hrd_education_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_education', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_education_translations;
