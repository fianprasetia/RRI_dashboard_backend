var koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_menu = require("./adm_menu");
const adm_authentication= koneksi.define(
  "adm_authentication",
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
        model: "adm_menu",
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
adm_authentication.belongsTo(adm_menu, { foreignKey: "id_menu" });
module.exports = adm_authentication;
