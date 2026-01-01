const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee_status_translations = koneksi.define(
  "hrd_employee_status_translations",
  {
    id_employee_status_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_employee_status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_employee_status",
        key: "code_employee_status"
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
    modelName: 'hrd_employee_status_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_employee_status', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
         name: 'code_employee_status_language_code_unique_index'
      },
    ],
  }
);
module.exports = hrd_employee_status_translations;
