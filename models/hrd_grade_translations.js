const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_grade_translations = koneksi.define(
  "hrd_grade_translations",
  {
    id_grade_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    grade_code: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "hrd_grade",
        key: "grade_code"
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
    modelName: 'hrd_grade_translations',
    indexes: [
      {
        unique: true,
        fields: ['grade_code', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_grade_translations;
