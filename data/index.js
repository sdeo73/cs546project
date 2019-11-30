const destinations = require('./destinations');
const signup = require('./signup');
const login = require('./login');
const userPrefData = require("./userPreferences");
const lawsData = require("./laws");
const prohibitedItemsData = require("./prohibitedItems");
const packingData = require('./packing');
const itineraryData = require('./itinerary');
const knapsackData = require('./knapsack');

module.exports = {
    signup: signup,
    login: login,
    userPreferences: userPrefData,
    destinations: destinations,
    laws: lawsData,
    prohibitedItems: prohibitedItemsData,
    packing: packingData,
    itinerary: itineraryData,
    knapsack: knapsackData
};