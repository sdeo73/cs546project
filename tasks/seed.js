const loginPage = require('../data/login');
const passwordHash = require('password-hash');
const laws = require("../data/Destination/laws.json");
const prohibitedItems = require("../data/Destination/prohibitedItems.json");
const lawFunctions = require('../data/laws');
const prohibitedItemFunctions = require('../data/prohibitedItems');
const connection = require("../config/mongoConnection");
// const objectHash = require('object-hash');
const crypto = require('crypto');

(async() => {
    try {
        //Keeping below commented code in order to create a user for testing
        // const user1 = await loginPage.insertUserData("test03@gmail.com", "1234");

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

        await prohibitedItemFunctions.deleteProhibitedItem("5dd481532bd9e47097a78e5a");

    } catch (err) {
        console.log(err.message);
    }

    const db = await connection();
    await db.serverConfig.close();
})();