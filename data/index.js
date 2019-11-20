const destinations = require('./destinations');
const signup = require('./signup');
const login = require('./login');
const userPrefData = require("./userPreferences");

module.exports = {
    signup: signup,
    login: login,
    userPreferences: userPrefData,
    destinations: destinations
};