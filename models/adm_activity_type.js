const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_activity_type_translations = require("./adm_activity_type_translations");
const fat_coa = require("./fat_coa");
const adm_activity_type = koneksi.define(
  "adm_activity_type",
  {
    code_activity_type: {
      type: Sequelize.STRING,
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
      // references: {
      //   model: "fat_coa",
      //   key: "code_coa"
      // },
      // onDelete: "Cascade",
      // onUpdate: "Cascade"
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
adm_activity_type.hasMany(adm_activity_type_translations, { foreignKey: "code_activity_type" });
// adm_activity_type.belongsTo(fat_coa, { through: 'adm_activity_type_coa', foreignKey: 'code_activity_type', otherKey: 'code_coa' });
module.exports = adm_activity_type;
