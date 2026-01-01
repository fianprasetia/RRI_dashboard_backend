const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_company = require("./adm_company");
const fat_accounting_periods = koneksi.define(
  "fat_accounting_periods",
  {
    id_accounting_periods: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    type: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    },
    period: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    finish_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    koneksi,
    modelName: 'fat_accounting_periods',
    indexes: [
      {
        unique: true,
        fields: ['code_company', 'period'],
      },
    ],
  }
);
fat_accounting_periods.hasOne(adm_company, { foreignKey: "code_company" });
// adm_period.belongsTo(adm_organization, { onDelete: 'RESTRICT',onUpdate: 'RESTRICT',  foreignKey: "sub_company" });
module.exports = fat_accounting_periods;
