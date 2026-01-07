const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("owl", "userview", "!userview",
  {
    host: "103.146.203.121",
    dialect: "mysql",
    logging: console.log,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;