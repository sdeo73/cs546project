const dubaiData = require("../data/Destination/dubai.json");
const destinationsData = require('../data/destinations');

(async() => {
    try {
        console.log("hello world");
        await destinationsData.removeThingToDo("5dd1a4e279a4e504042dc960", "Yas Waterworld");
        console.log("Finished database query");
    } catch (err) {
        console.log(err);
    }
})();