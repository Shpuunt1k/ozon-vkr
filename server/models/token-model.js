const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const { User } = require('./user-model'); // Используйте правильный путь

const Token = sequelize.define('Token', {
    refreshToken: { type: DataTypes.STRING(512), allowNull: false },
});

Token.belongsTo(User);

module.exports = {
    Token
};


