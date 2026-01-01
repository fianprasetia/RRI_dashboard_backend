const koneksi = require("../config/database");
const Sequelize = require("sequelize");
const adm_user_login = require("./adm_user_login");
const adm_user_token = koneksi.define(
  "adm_user_token",
  {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "adm_user_login",
            key: "username"
        },
        onDelete: "Cascade",
        onUpdate: "Cascade"
    },
    token: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    access_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    expired_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    koneksi,
    modelName: 'adm_user_token',
    indexes: [
      {
        unique: true,
        fields: ['username', 'access_type'],  // Menambahkan constraint UNIQUE pada kombinasi kolom userId dan productId
      },
    ],
  }
);
adm_user_token.hasMany(adm_user_login, { foreignKey: "username" });
module.exports = adm_user_token;
