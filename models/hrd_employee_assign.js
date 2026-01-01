const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const hrd_employee = require("./hrd_employee")
const adm_company = require("./adm_company")
const hrd_working_hours = require("./hrd_working_hours")
const hrd_employee_assign = koneksi.define(
  "hrd_employee_assign",
  {
    employee_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "hrd_employee",
        key: "employee_id"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
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
    monday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    tuesday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    wednesday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    thursday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    friday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    saturday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    sunday: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "hrd_working_hours",
        key: "id_working_hours"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
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
hrd_employee_assign.belongsTo(hrd_employee, { foreignKey: "employee_id" });
hrd_employee_assign.belongsTo(adm_company, { foreignKey: "code_company" });

hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "monday", as: "MondayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "tuesday", as: "TuesdayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "wednesday", as: "WednesdayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "thursday", as: "ThursdayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "friday", as: "FridayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "saturday", as: "SaturdayHours" });
hrd_employee_assign.belongsTo(hrd_working_hours, { foreignKey: "sunday", as: "SundayHours" });
module.exports = hrd_employee_assign;
