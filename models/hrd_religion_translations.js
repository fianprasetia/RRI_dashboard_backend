const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_religion_translations = koneksi.define(
  "hrd_religion_translations",
  {
    id_religio_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_religion: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_religion",
        key: "code_religion"
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
    modelName: 'hrd_religion_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_religion', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_religion_translations;
