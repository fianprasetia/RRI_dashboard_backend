const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_term_of_payment_translations = koneksi.define(
  "log_term_of_payment_translations",
  {
    id_term_of_payment_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    code_term_of_payment: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "log_term_of_payment",
        key: "code_term_of_payment"
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
    // modelName: 'log_term_of_payment_translations',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['code_term_of_payment', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
    //   },
    // ],
  }
);
module.exports = log_term_of_payment_translations