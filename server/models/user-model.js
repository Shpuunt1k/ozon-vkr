const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
    activationLink: { type: DataTypes.STRING },
    secretId: { type: DataTypes.STRING, allowNull: true },
    secretKey: { type: DataTypes.STRING, allowNull: true },
});

module.exports = {
    User
};

