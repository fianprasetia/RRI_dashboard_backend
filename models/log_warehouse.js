const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_item_master = require("./log_item_master")
const adm_company = require("./adm_company")
const log_warehouse = koneksi.define(
  "log_warehouse",
  {
    code_company: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_company",
        key: "code_company"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    warehouse: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_company",
        key: "code_company"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    period: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code_item: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "log_item_master",
        key: "code_item"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    initial_qty: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "qty awal"
    },
    incoming_qty: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "qty masuk"
    },
    outgoing_qty: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "qty keluar"
    },
    beginning_price: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "harga awal"
    },
    incoming_price: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "harga masuk"
    },
    outgoing_price: {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      comment: "harga keluar"
    },
    storage_location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    // indexes: [
    //   {
    //     name: "idx_code_category", // Nama index
    //     fields: ["code_category"], // Kolom yang diindeks
    //   },
    //   {
    //     name: "idx_name_status", // Nama index
    //     fields: ["name", "status"], // Composite index
    //   },
    // ],
  }
);
log_warehouse.belongsTo(log_item_master, { foreignKey: "code_item" });
log_warehouse.belongsTo(adm_company, { foreignKey: "warehouse", as: "worksite" });
module.exports = log_warehouse;
