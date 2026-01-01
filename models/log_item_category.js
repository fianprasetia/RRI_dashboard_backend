const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_category_translations = require("./log_item_category_translations")
const fat_coa = require("./fat_coa")
const log_item_category = koneksi.define(
  "log_item_category",
  {
    code_category: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    code_coa: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "fat_coa",
        key: "code_coa"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
  },
  {
    freezeTableName: true,
  }
);
log_item_category.hasMany(log_item_category_translations, { foreignKey: "code_category" });
log_item_category.belongsTo(fat_coa, { foreignKey: "code_coa" });

module.exports = log_item_category;
