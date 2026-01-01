const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_marital_translations = koneksi.define(
  "hrd_employee_marital_translations",
  {
    id_employee_marital_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    marital_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_marital",
        key: "marital_code"
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
    modelName: 'hrd_employee_marital_translations',
    indexes: [
      {
        unique: true,
        fields: ['marital_code', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_employee_marital_translations