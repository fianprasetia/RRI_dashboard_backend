const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_gender_translations = koneksi.define(
  "hrd_gender_translations",
  {
    id_gender_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    gender_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_gender",
        key: "gender_code"
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
    modelName: 'hrd_gender_translations',
    indexes: [
      {
        unique: true,
        fields: ['gender_code', 'language_code'], 
      },
    ],
  }
);
module.exports = hrd_gender_translations;
