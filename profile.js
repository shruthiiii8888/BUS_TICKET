const { DataTypes } = require('sequelize');
const sequelize = require("../Node.Js-Authentication-System-master/seq");
const PersonalInfo = sequelize.define('PersonalInfo', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
  });
  
  module.exports = PersonalInfo;
