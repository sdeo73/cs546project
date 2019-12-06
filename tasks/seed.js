const loginPage = require('../data/login');
const passwordHash = require('password-hash');
const laws = require("../data/Destination/laws.json");
const dubai = require("../data/Destination/dubai.json");
const prohibitedItems = require("../data/Destination/prohibitedItems.json");
const lawFunctions = require('../data/laws');
const signUpFunctions = require('../data/signup');
const userPreFunctions = require('../data/userPreferences');
const usersFunctions = require('../data/users');
const prohibitedItemFunctions = require('../data/prohibitedItems');
const destinationFunctions = require('../data/destinations');
const connection = require("../config/mongoConnection");
const locationData = require("../data/location");

(async() => {
    try {
        // let index;
        // //Insert all laws from laws.JSON into the database
        // for(index in laws) {
        //     try {
        //         await lawFunctions.createLaw(laws[index].description);
        //     } catch (error) {
        //         if(error.name=="MongoError" && error.code==11000) { //Error message and code in case of duplicate insertion
        //             index++; //Skip duplicate entry and continue
        //         }
        //     }
        // }

        // //Insert all prohibited items from prohibitedItems.JSON into the database
        // for(index in prohibitedItems) {
        //     try {
        //         await prohibitedItemFunctions.createProhibitedItem(prohibitedItems[index].item_name);
        //     } catch (error) {
        //         if(error.name=="MongoError" && error.code==11000) {//Error message and code in case of duplicate insertion
        //             index++; //Skip duplicate entry and continue
        //         }
        //     }
        // }

        //Insert all destinations (only dubai for now) from dubai.json into the database
        try {
            const addedDubai = await destinationFunctions.addDestination(dubai.d_name, dubai.country, dubai.weather, dubai.thingsToDo, dubai.restaurants, dubai.countryCustoms);
            console.log(addedDubai);
        } catch (error) {
            if(error.name=="MongoError" && error.code==11000) {//Error message and code in case of duplicate insertion
                index++; //Skip duplicate entry and continue
            }
        }

        // //calls location.js getNearbyRestaurants function
        // //lat, lon, filePath, currencyConversionFactor
        // try {
        //     //25.193742, 55.274745, 1USD = 3.67AED
        //     await locationData.getNearbyRestaurants(25.285323, 55.370771, "../data/Destination/dubai.json", 3.67);
        //     await locationData.getNearbyRestaurants(25.328786, 55.375579, "../data/Destination/dubai.json", 3.67);
        //     await locationData.getNearbyRestaurants(25.297163, 55.415984, "../data/Destination/dubai.json", 3.67);
        //     await locationData.getNearbyRestaurants(25.339623, 55.443453, "../data/Destination/dubai.json", 3.67);
        //     await locationData.getNearbyRestaurants(25.403719, 55.490722, "../data/Destination/dubai.json", 3.67);
        //     await locationData.getNearbyRestaurants(25.308973, 55.518592, "../data/Destination/dubai.json", 3.67);
        // } catch (err) {
        //     console.log(err.message);
        // }

    } catch (err) {
        console.log(err.message);
    }

    const db = await connection();
    await db.serverConfig.close();
})();