
const signup = require('./signup');
const login = require('./login');
const userPrefData = require("./userPreferences");
const lawsData = require("./laws");
const prohibitedItemsData = require("./prohibitedItems");

module.exports = {
    signup: signup,
    login: login,
    userPreferences: userPrefData,
    laws: lawsData,
    prohibitedItems: prohibitedItemsData
};