const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_activity_translations = require("./adm_activity_translations");
const fat_coa = require("./fat_coa");
const adm_activity_type = require("./adm_activity_type");
const adm_activity = koneksi.define(
  "adm_activity",
  {
    code_activity: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code_coa: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: "fat_coa",
        key: "code_coa"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_activity_type: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_activity_type",
        key: "code_activity_type"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    uom: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    premi: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    // koneksi,
    // modelName: 'adm_user_token',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['username', 'access_type'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
    //   },
    // ],
  }
);
adm_activity.hasMany(adm_activity_translations, { foreignKey: "code_activity" });
adm_activity.belongsTo(fat_coa, { foreignKey: "code_coa" });
adm_activity.belongsTo(adm_activity_type, { foreignKey: "code_activity_type" });
module.exports = adm_activity;
