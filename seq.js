const Sequelize=require("sequelize");
const dbConfig = require("../Node.Js-Authentication-System-master/db");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,  {
    host: dbConfig.HOST,
    port:dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: false
  });
module.exports=sequelize;