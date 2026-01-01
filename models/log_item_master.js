const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_category = require("./log_item_category")
const log_item_master = koneksi.define(
  "log_item_master",
  {
    code_category: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "log_item_category",
        key: "code_category"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    code_item: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    uom: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        name: "idx_code_category", // Nama index
        fields: ["code_category"], // Kolom yang diindeks
      },
      {
        name: "idx_name_status", // Nama index
        fields: ["name", "status"], // Composite index
      },
    ],
  }
);
log_item_master.belongsTo(log_item_category, { foreignKey: "code_category" });
module.exports = log_item_master;
