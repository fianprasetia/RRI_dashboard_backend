const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_asset_type_translations = koneksi.define(
  "fat_asset_type_translations",
  {
    id_asset_type_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_asset_type: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "fat_asset_type",
        key: "code_asset_type"
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
    // koneksi,
    // modelName: 'fat_asset_type_translations',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['code_coa', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
    //   },
    // ],
  }
);
module.exports = fat_asset_type_translations;
