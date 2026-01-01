const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const log_receiving_locations = koneksi.define(
  "log_receiving_locations",
  {
    id_receiving_locations: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    contact_person: {
      type: Sequelize.STRING,
      allowNull: true
    },
    contact_phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);
module.exports = log_receiving_locations;
