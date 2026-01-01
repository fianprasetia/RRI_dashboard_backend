const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_tax_translations = koneksi.define(
  "hrd_employee_tax_translations",
  {
    id_employee_tax_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    employee_tax_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_employee_tax",
        key: "employee_tax_code"
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
    modelName: 'hrd_employee_tax_translations',
    indexes: [
      {
        unique: true,
        fields: ['employee_tax_code', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_employee_tax_translations