const laws = require("../data/Destination/laws.json");
const dubai = require("../data/Destination/dubai.json");
const prohibitedItems = require("../data/Destination/prohibitedItems.json");
const packingList = require("../data/Destination/packingList.json");
const tourGuides = require("../data/Destination/tourGuides.json");
const users = require("../data/Destination/users.json");
const signupFunctions = require("../data/signup");
const tourGuidesFunctions = require("../data/tourGuides");
const lawFunctions = require('../data/laws');
const prohibitedItemFunctions = require('../data/prohibitedItems');
const packingListFunctions = require("../data/packing");
const destinationFunctions = require('../data/destinations');
const connection = require("../config/mongoConnection");
const mongoCollections = require("../config/mongoCollections");
const destinations = mongoCollections.destinations;

(async () => {
    try {
        let index;
        //Insert initial user(s) from users.JSON into the database
        for (index in users) {
            try {
                let user = users[index];
                await signupFunctions.addUserWithoutHash(user.firstName, user.lastName, user.email, user.password, user.nationality);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //Insert all tour guides from tourGuides.JSON into the database
        for (index in tourGuides) {
            try {
                let tourGuide = tourGuides[index];
                await tourGuidesFunctions.addTourGuide(tourGuide.name, tourGuide.email, tourGuide.phone, tourGuide.dailyCost, tourGuide.city, tourGuide.language);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }
        //Insert all laws from laws.JSON into the database
        for (index in laws) {
            try {
                await lawFunctions.createLaw(laws[index].description);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //Insert all prohibited items from prohibitedItems.JSON into the database
        for (index in prohibitedItems) {
            try {
                await prohibitedItemFunctions.createProhibitedItem(prohibitedItems[index].item_name);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) {//Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //Insert all packing items from packingList.JSON into the database
        for(index in packingList) {
            try {
              await packingListFunctions.createPackingList(packingList[index].type, packingList[index].items);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) {//Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //Insert data from Dubai.json into the database
        try {
            const addedDubai = await destinationFunctions.addDestination(dubai.d_name, dubai.country, dubai.weather, dubai.thingsToDo, dubai.restaurants, dubai.countryCustoms);
            console.log(addedDubai);
        } catch (error) {
            if (error.name == "MongoError" && error.code == 11000) {//Error message and code in case of duplicate insertion
                index++; //Skip duplicate entry and continue
            }
        }

        //Insert laws into destination 'laws' array
        const destinationCollection = await destinations();
        const destination = await destinationCollection.findOne({d_name:"Dubai"});
        const allLaws = await lawFunctions.getAllLaws();
        if(allLaws!==null && destination!==undefined)  {
            for(index in allLaws) {
                await destinationFunctions.addLaw(destination._id.toString(), allLaws[index]._id.toString());
            }
        }

        //Insert prohibited items into destination 'prohibitedItems' array
        const allItems = await prohibitedItemFunctions.getAllProhibitedItems();
        if(allItems!==null && destination!==undefined)  {
            for(index in allItems) {
                await destinationFunctions.addProhibitedItem(destination._id.toString(), allItems[index]._id.toString());
            }
        }

    } catch (err) {
        console.log(err.message);
    }

    const db = await connection();
    await db.serverConfig.close();
})();