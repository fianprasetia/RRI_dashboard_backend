const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_working_hours_translations = require("./hrd_working_hours_translations")
const hrd_working_hours = koneksi.define(
  "hrd_working_hours",
  {
    id_working_hours: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    on_duty_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    off_duty_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    late_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    leave_early_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    beginning_in: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    ending_in: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    beginning_out: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    ending_out: {
      type: Sequelize.TIME,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    // koneksi,
    // modelName: 'hrd_catu_translations',
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['catu_code', 'language_code'],
    //   },
    // ],
  }
);
hrd_working_hours.hasMany(hrd_working_hours_translations, { foreignKey: "id_working_hours" });
module.exports = hrd_working_hours;
