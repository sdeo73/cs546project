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

/**
 * Selects an array of things to do based on the given two constraints: maximum budget and time (hours per day).
 * Throws errors if invalid arguments were given or empty array is generated.
 * 
 * @param allThings an array of objects with things to do
 * @param maxBudget maximum total budget allotted
 * @param maxTime maximum time allotted
 * @returns 
 */
async function selectAllThings(allThings, maxBudget, maxTime, tourType) {
    if (arguments.length != 4 || !allThings || !maxBudget || !maxTime || !tourType) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    
    if (typeof allThings != "object" || Number.isNaN(maxBudget) || Number.isNaN(maxTime) || typeof tourType != "string") {
        throw new Error(errorMessages.itineraryArgumentIncorrectType);
    }

    let finalItems = [];
    // for (let thing in allThings) {
    //     let currentItem = allThings[thing];
    //     console.log(`currentItem = ${currentItem}`);
    // }
    console.log(`allThings[tourType] = ${JSON.stringify(allThings[tourType])}`);
    if (allThings[tourType].length > 0) {
        console.log(`TourType ${tourType} exists`);
    }
    
    return finalItems;
}

/** */
function sortAllThings(allThings, tourTypeList) {
    let sortedAllThings = {};
    for (let obj in allThings) {
        //key = tourType, value = an array of allThings objects with the same tourType
        let temp = [];
        let objTourType = allThings[obj].type.toLowerCase();
        if (objTourType in sortedAllThings) {   //tour type already exists
            temp = sortedAllThings[objTourType];
        }
        temp.push(allThings[obj]);
        sortedAllThings[objTourType] = temp;
        // sortedAllThings[tourTypeList[]]
    }
    let resultThings = [];
    for (let i = 0; i < tourTypeList.length; i++) {
        let currentItems = sortedAllThings[tourTypeList[i]];
        resultThings = resultThings.concat(currentItems);//can't do this
    }

    // return sortedAllThings;
    return resultThings;
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

    let allThings = destinationObj.thingsToDo;
    let restaurants = destinationObj.restaurants;

    //is this step necessary? Time efficiency wise?
    allThings.sort(compare);   //sorts the allThings by tour type
    let tourTypeList = generateTourTypePriority(userPreferences.tourType);
    // console.log(JSON.stringify(allThings.sort(compare)));
    let sortedThings = sortAllThings(allThings, tourTypeList);

    console.log(JSON.stringify(sortedThings));
    
    //allThings, maxBudget, maxTime
    // await selectAllThings(sortedThings, userPreferences.maxBudgetPerPerson, userPreferences.hoursPerDay, userPreferences.tourType);
}

function generateTourTypePriority(tourType) {
    //User can select: Business, Hiking, Scenic, Adventure, Historical, Sightseeing
    //Destination type: Leisure, Shopping, Historical, Sightseeing, Theme Park, Adventure, Entertainment, Museum
    let priorityList = {
        business: ["shopping", "sightseeing", "leisure", "entertainment", "museum", "historical", "theme park", "adventure"],
        hiking: ["adventure", "sightseeing", "historical", "museum", "shopping", "leisure", "entertainment", "theme park"],
        scenic: ["leisure", "sightseeing", "shopping", "entertainment", "museum", "historical", "theme park", "adventure"],
        adventure: ["adventure", "sightseeing", "theme park", "historical", "shopping", "entertainment", "museum", "leisure"],
        historical: ["historical", "museum", "sightseeing", "shopping", "entertainment", "leisure", "theme park", "adventure"],
        sightseeing: ["sightseeing", "historical", "museum", "shopping", "entertainment", "theme park", "leisure", "adventure"]
    }
    return priorityList[tourType.toLowerCase()];
}

/** */
async function main() {
    try {
        //10, 1000, 14, 5
        //destinationId, tourType, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers
        let userPreferences = {
            destinationId: "5ddedd9410fe736d50e80b75",
            tourType: "hiking",
            hoursPerDay: 10,
            maxBudgetPerPerson: 1000,
            numOfDays: 14,
            numOfTravelers: 5
        };
        let resultItinerary = await generateCompleteItinerary(userPreferences);
    } catch (err) {
        console.log(err.message);
    }
}

main();

module.exports = {generateCompleteItinerary};