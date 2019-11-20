const signup = require('./signup');
const login = require('./login');
const userPrefData = require("./userPreferences");
const packingData = require('./packing');

module.exports = {
    signup: signup,
    login: login,
    userPreferences: userPrefData,
    packing: packingData
};