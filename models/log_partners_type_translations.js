const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_partners_type_translations = koneksi.define(
  "log_partners_type_translations",
  {
    code_partners_type_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    code_partners_type: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "log_partners_type",
        key: "code_partners_type"
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
    modelName: 'log_partners_type_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_partners_type', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = log_partners_type_translations