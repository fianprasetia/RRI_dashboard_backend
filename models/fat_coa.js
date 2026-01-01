const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const fat_coa_translations = require("./fat_coa_translations")
const adm_activity_type = require("./adm_activity_type")
const fat_coa = koneksi.define(
  "fat_coa",
  {
    code_coa: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    parent_coa: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descriptions_coa: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    level_coa: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type_coa: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    entity_coa: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status_coa: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);
fat_coa.hasMany(fat_coa_translations, { foreignKey: "code_coa" });
// fat_coa.belongsToMany(adm_activity_type, { through: 'adm_activity_type_coa', foreignKey: 'code_coa', otherKey: 'code_activity_type' });
module.exports = fat_coa;
