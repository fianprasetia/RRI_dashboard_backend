const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_job_title_translations = koneksi.define(
  "hrd_job_title_translations",
  {
    id_job_title_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    id_job_title: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_job_title",
        key: "id_job_title"
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
    modelName: 'hrd_job_title_translations',
    indexes: [
      {
        unique: true,
        fields: ['id_job_title', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_job_title_translations;
