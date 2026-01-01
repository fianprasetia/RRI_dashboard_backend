var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_menu_mobile = require("./adm_menu_mobile");
const adm_authentication_mobile= koneksi.define(
  "adm_authentication_mobile",
  {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "adm_user_login",
        key: "username"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
    id_menu: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "adm_menu_mobile",
        key: "id_menu"
      },
      onDelete: "Cascade",
      onUpdate: "Cascade"
    },
  },
  {
    freezeTableName: true,
  }
);
adm_authentication_mobile.belongsTo(adm_menu_mobile, { foreignKey: "id_menu" });
module.exports = adm_authentication_mobile;
