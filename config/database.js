const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("epps", "postgres", "S3nyumpag1h4ri",
  {
    host: "103.174.114.117",
    // host: "localhost",
    dialect: "postgres",
    logging: console.log,
  }
);

try {
  sequelize.authenticate();
  sequelize.sync(
    {
      alter: true
    }
  );
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
module.exports = sequelize;