const location = require('./location');
const destinationFunctions = require('./destinations');
const errorMessages = require('../public/errorMessages');

// Array to store the list of places already visited in this itinerary
let visitedThings = [];
let visitedRestaurants = [];
//Make all the budgetNextDay and budgetRemaining variables as global variables so the program run faster?
let excessBudget = 0;
let budgetPerDay = 0;

let totalSpent = 0;
let totalHours = 0;

/** */
function compare(a, b) {
    if (a.type < b.type){
        return -1;
    }
    if (a.type > b.type){
        return 1;
    }
    return 0;
}

/** */
function sortThingsToDo(thingsToDo) {
    let sortedThingsToDo = {};
    for (let obj in thingsToDo) {
        //key = tourType, value = an array of thingsToDo objects with the same tourType
        let temp = [];
        if (thingsToDo[obj].type in sortedThingsToDo) {   //tour type already exists
            temp = sortedThingsToDo[thingsToDo[obj].type];
        }
        temp.push(thingsToDo[obj]);
        sortedThingsToDo[thingsToDo[obj].type] = temp;
    }
    console.log(JSON.stringify(sortedThingsToDo));
    return sortedThingsToDo;
}

/** */
async function generateCompleteItinerary(userPreferences) {
    //validates number of argument
    if (arguments.length != 1) {
        throw new Error(errorMessages.wrongNumberOfArguments);  
    }
    //validates argument type
    if (typeof userPreferences != "object") {
        throw new Error(errorMessages.itineraryArgumentMissing); 
    }
    let destinationObj = await destinationFunctions.getDestinationById(userPreferences.destinationId);

    let thingsToDo = destinationObj.thingsToDo;
    let restaurants = destinationObj.restaurants;

    thingsToDo.sort(compare);   //sorts the thingsToDo by tour type

    // console.log(JSON.stringify(thingsToDo.sort(compare)));
    sortThingsToDo(thingsToDo);
}

async function main() {
    try {
        //10, 1000, 14, 5
        //destinationId, tourType, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers
        let userPreferences = {
            destinationId: "5dde98e1de6ddc6150e5aa75",
            tourType: "hiking",
            hoursPerDay: 10,
            maxBudgetPerPerson: 1000,
            numOfDays: 14,
            numOfTravelers: 5
        };
        let resultItinerary = generateCompleteItinerary(userPreferences);
    } catch (err) {
        console.log(err.message);
    }
}

main();

module.exports = {generateCompleteItinerary};