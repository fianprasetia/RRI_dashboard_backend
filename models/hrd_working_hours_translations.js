const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_working_hours_translations = koneksi.define(
  "hrd_working_hours_translations",
  {
    id_working_hours_translations:{
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey:true,
      autoIncrement:true      
    },
    id_working_hours: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
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
    modelName: 'hrd_working_hours_translations',
    indexes: [
      {
        unique: true,
        fields: ['id_working_hours', 'language_code'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
module.exports = hrd_working_hours_translations