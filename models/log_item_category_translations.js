const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_category_translations = koneksi.define(
  "log_item_category_translations",
  {
    code_category_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    code_category: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "log_item_category",
        key: "code_category"
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
    modelName: 'log_item_category_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_category', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = log_item_category_translations