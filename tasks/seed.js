const dubaiData = require("../data/Destination/dubai.json");
const destinationsData = require('../data/destinations');

(async() => {
    try {
        console.log("hello world");
        // await destinationsData.addDestination("Dubai", dubaiData.country, dubaiData.weather, dubaiData.thingsToDo, dubaiData.restaurants, dubaiData.countryCustoms);
        // console.log(await destinationsData.getDestinationById("5dd19529a1ad013db0a779f5"));
        // await destinationsData.deleteDestinationById("5dd19529a1ad013db0a779f5");
        // console.log(await destinationsData.getAllDestinations());
        // console.log(await destinationsData.addLaw("5dd1a4e279a4e504042dc960", "testingLaw"));
        // await destinationsData.addLaw("5dd1a4e279a4e504042dc960", "testingLaw2");
        // await destinationsData.addProhibitedItem("5dd1a4e279a4e504042dc960", "testingItem2");
        // await destinationsData.addPackingList("5dd1a4e279a4e504042dc960", "testingItem2");
        // console.log(await destinationsData.getAllProhibitedItems("5dd1a4e279a4e504042dc960"));
        // console.log(await destinationsData.getAllPackingList("5dd1a4e279a4e504042dc960"));
        // let newRestaurant = {
        //     "name": "Pizzeria Hoboken",
        //     "location": "723 Jefferson Street, Hoboken, NJ 07030",
        //     "cuisine": ["Italian"],
        //     "avgCostPerPerson": 15
        // };
        // console.log(await destinationsData.addRestaurantToDest("5dd1a4e279a4e504042dc960", newRestaurant));
        let newThing = {
            "name": "Six Flags Great Adventure",
            "location": "1 Six Flags Blvd, Jackson, NJ 08257",
            "type": "Leisure",
            "avgCostPerPerson": 100,
            "avgTimeSpent": 10,
            "accessibility": true
        };
        console.log(await destinationsData.addThingToDest("5dd1a4e279a4e504042dc960", newThing));
        console.log("Finished database query");
    } catch (err) {
        console.log(err);
    }
})();