
const signup = require('./signup');
const login = require('./login');
const userPrefData = require("./userPreferences");

module.exports = {
    signup: signup,
    login: login,
    userPreferences: userPrefData
};