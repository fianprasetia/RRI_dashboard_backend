const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_job_title_translations = require("./hrd_job_title_translations");
const hrd_department = require("./hrd_department");
const hrd_job_title = koneksi.define(
  "hrd_job_title",
  {
    department_code: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: "hrd_department",
        key: "department_code"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    id_job_title: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
hrd_job_title.hasMany(hrd_job_title_translations, { foreignKey: "id_job_title" });
hrd_job_title.belongsTo(hrd_department, { foreignKey: "department_code" });
module.exports = hrd_job_title;
