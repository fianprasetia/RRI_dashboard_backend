const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_activity_translations = koneksi.define(
  "adm_activity_translations",
  {
    id_activity_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_activity: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: "adm_activity",
        key: "code_activity"
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
module.exports = adm_activity_translations;
