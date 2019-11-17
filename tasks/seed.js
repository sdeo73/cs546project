const dubaiData = require("../data/Destination/dubai.json");
const destinationsData = require('../data/destinations');

(async() => {
    try {
        destinationsData.createDestination(dubaiData.d_name, dubaiData.country, dubaiData.weather, dubaiData.thingsToDo, dubaiData.restaurants, dubaiData.countryCustoms);
        // console.log(getDestinationById("testing"));
    } catch (err) {
        console.log(err);
    }
})();