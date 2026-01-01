const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_payment_voucher_type_translations = koneksi.define(
  "fat_payment_voucher_type_translations",
  {
    id_voucher_type_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_payment_voucher_type: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "fat_payment_voucher_type",
        key: "code_payment_voucher_type"
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
module.exports = fat_payment_voucher_type_translations;
