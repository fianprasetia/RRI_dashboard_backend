const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const plt_harvest_penalty_type_translations = koneksi.define(
  "plt_harvest_penalty_type_translations",
  {
    id_type_harvest_penalty_translations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code_harvest_penalty: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "plt_harvest_penalty_type",
        key: "code_harvest_penalty"
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
    sequelize: koneksi,
    modelName: 'plt_harvest_penalty_type_translations',
    indexes: [
      {
        unique: true,
        fields: ['code_harvest_penalty', 'language_code'],
        name: 'unique_plt_harvest_penalty_type_translations'
      },
    ],
  }
);
module.exports = plt_harvest_penalty_type_translations;
