const loginPage = require('../data/login');
const passwordHash = require('password-hash');
const laws = require("../data/Destination/laws.json");
const prohibitedItems = require("../data/Destination/prohibitedItems.json");
const lawFunctions = require('../data/laws');
const signUpFunctions = require('../data/signup');
const userPreFunctions = require('../data/userPreferences');
const usersFunctions = require('../data/users');
const prohibitedItemFunctions = require('../data/prohibitedItems');
const connection = require("../config/mongoConnection");
// const objectHash = require('object-hash');

(async() => {
    try {
        let index;
        //Insert all laws from laws.JSON into the database
        for(index in laws) {
            try {
                await lawFunctions.createLaw(laws[index].description);
            } catch (error) {
                if(error.name=="MongoError" && error.code==11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //Insert all prohibited items from prohibitedItems.JSON into the database
        for(index in prohibitedItems) {
            try {
                await prohibitedItemFunctions.createProhibitedItem(prohibitedItems[index].item_name);
            } catch (error) {
                if(error.name=="MongoError" && error.code==11000) {//Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

    } catch (err) {
        console.log(err.message);
    }

    const db = await connection();
    await db.serverConfig.close();
})();