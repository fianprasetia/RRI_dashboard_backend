const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_payment_voucher_type_translations = require("./fat_payment_voucher_type_translations")
const fat_payment_voucher_type = koneksi.define(
  "fat_payment_voucher_type",
  {
    code_payment_voucher_type: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    descriptions: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
fat_payment_voucher_type.hasMany(fat_payment_voucher_type_translations, { foreignKey: "code_payment_voucher_type", as: 'translations'});
module.exports = fat_payment_voucher_type;
