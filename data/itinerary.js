const location = require('./location');
const destinationFunctions = require('./destinations');
const errorMessages = require('../public/errorMessages');

//global variables
// all the available restaurants from the database
let allRestaurants = [];
//daily budget
let budgetPerDay = -1;
//number of available hours per day
let hourPerDay = -1;
//total number of days of the itinerary
let totalNumOfDays = -1
//the amount of daily budget allocated to dining per day
let restaurantBudget = 0.2;
//money left after dining
let excessBudget = 0;
//total money spent for the entire trip
let totalSpent = 0;
//total hours spent for the entire trip
let totalHours = 0;

/** 
 * Compares the two given thingsToDo objects' type, returns negative integer if B object type is
 * larger than A object type alphabetically, returns positive integer if A object type is
 * larger than B object type alphabetically, returns zero if the two types are equal.
 * Throws error if invalid arguments were provided.
 * 
 * @param a the first thingToDo object.
 * @param b the second thingToDo object.
 * @returns integer indicates whether a and b objects' types are equal or not.
*/
function compareTourType(a, b) {
    //validates arguments
    if (arguments.length != 2 || !a || !b || typeof a !== "object" || typeof b !== "object") {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    if (a.type < b.type){
        return -1;
    }
    if (a.type > b.type){
        return 1;
    }
    return 0;
}

/** 
 * Compares the two given thingsToDo objects' distance, returns negative integer if B object distance is
 * larger than A object distance alphabetically, returns positive integer if A object distance is
 * larger than B object distance alphabetically, returns zero if the two distances are equal.
 * Throws error if invalid arguments were provided.
 * 
 * @param a the first thingToDo object.
 * @param b the second thingToDo object.
 * @returns integer indicates whether a and b objects' distances are equal or not.
*/
function compareDistance(a, b) {
    //validates arguments
    if (arguments.length != 2 || !a || !b || typeof a !== "object" || typeof b !== "object") {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    if (a.distance < b.distance){
        return -1;
    }
    if (a.distance > b.distance){
        return 1;
    }
    return 0;
}

/** 
 * Selects restaurants that are within the given maximum budget and count. Throws errors
 * if invalid arguments were provided.
 * 
 * @param allRestaurants all the available restaurant objects.
 * @param maxBudget maximum budget for select restaurants.
 * @param maxRestaurantCount maximum number of restaurant that can be selected.
 * @returns selectedRestaurants an array of selected restaurant objects.
*/
function selectRestaurants(allRestaurants, maxBudget, maxRestaurantCount) {
    //validates argumenets type
    if (arguments.length != 3 || !maxBudget || !maxRestaurantCount || !allRestaurants) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    if (!Array.isArray(allRestaurants) || Number.isNaN(maxBudget) || Number.isNaN(maxRestaurantCount)) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    let selectedRestaurants = [];
    let restaurantCount = 0;
    let index = 0;
    while (restaurantCount < maxRestaurantCount && index != allRestaurants.length) {
        let currentRestaurant = allRestaurants[index];
        let itemCost = currentRestaurant.avgCostPerPerson;
        if (maxBudget >= itemCost) {    //within budget
            maxBudget -= itemCost;
            totalSpent += itemCost;     
            restaurantCount++;
            allRestaurants.splice(index, 1);
            currentRestaurant.group = "restaurant";
            selectedRestaurants.push(currentRestaurant);
        }
        index++;
    }
    excessBudget = maxBudget;   //money left after dining
    return selectedRestaurants;
}

/**
 * Selects an array of things to do based on the given two constraints: maximum budget and time (hours per day).
 * Throws errors if invalid arguments were given or empty array is generated.
 * 
 * @param allThings an array of objects with things to do.
 * @param maxBudget maximum total budget allotted.
 * @param maxTime maximum time allotted.
 * @returns finalArr an array of daily itinerary objects.
 */
async function selectThingsToDo(allThings) {
    //validates argument number and type
    if (arguments.length != 2 || !allThings) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    if (!Array.isArray(allThings)) {
        throw new Error(errorMessages.itineraryArgumentIncorrectType);
    }

    let finalArr = [];  //daily itinerary array consists of thingsToDo and restaurants
    let dailyItems = [];
    let dailyBudget = budgetPerDay;
    let dailyTime = hourPerDay;
    let dayCount = 0;
    let startOfTheDay = true;
    let startLocation = null;   

    for (let thing in allThings) {  //scans through all the available thingsToDo
        let restaurants = [];
        if (startOfTheDay) {   //select restaurants for the current day
            let currentRestaurantBudget = dailyBudget * restaurantBudget;
            dailyBudget -= currentRestaurantBudget;
            restaurants = selectRestaurants(allRestaurants, currentRestaurantBudget, 2);
            dailyBudget += excessBudget;
            finalArr[dayCount] = restaurants;
            startOfTheDay = false;
        }
        let currentItem = allThings[thing];
        let itemCost = currentItem.avgCostPerPerson;
        let itemTime = currentItem.avgTimeSpent;
        if (startLocation === null) {   //set current day's starting address
            startLocation = allThings[thing].location;
        }
        
        //selects thingsToDo for the current day
        if (dailyBudget >= itemCost && dailyTime >= itemTime) { //within budget
            allThings[thing].group = "thingToDo";
            allThings[thing].distance = await location.calculateDistanceAddress(startLocation, allThings[thing].location);
            dailyItems.push(allThings[thing]);  //add the items to current day's itinerary
            dailyBudget -= itemCost;
            dailyTime -= itemTime;
            totalSpent += itemCost;
            totalHours += itemTime;
        } else {    //out of budget or time, concludes the date
            let tempDay = finalArr[dayCount];
            dailyItems.sort(compareDistance);   //sorts the selected thingsToDo by their distance to daily start location.
            if (tempDay) {
                finalArr[dayCount] = tempDay.concat(dailyItems);
            } else {
                finalArr[dayCount] = dailyItems;
            }
            //resets attributes
            dailyItems = []; //clears dailyItems array
            dailyBudget = budgetPerDay + dailyBudget;
            dailyTime = hourPerDay;
            dayCount++;
            startLocation = null;
            startOfTheDay = true; 
        }
        if (dayCount >= totalNumOfDays) {  //completes generating all the daily itinerary
            break;
        }
    }
    return finalArr;
}

/** 
 * Sorts the thingsToDo array based on user's preferred tour type priorities.
 * Throws error if invalid arguments were provided.
 * 
 * @param allThings all the unsorted thingsToDo items.
 * @param tourTypeList an array with user's tour type priorities.
 * @returns array an array of sorted thingsToDo items.
*/
function sortThingsByTourType(allThings, tourTypeList) {
    //validates argument number and type
    if (arguments.length != 2 || !allThings || !tourTypeList) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    if (!Array.isArray(allThings) || !Array.isArray(tourTypeList)) {
        throw new Error(errorMessages.itineraryArgumentIncorrectType);
    }
    let sortedAllThings = {};
    for (let obj in allThings) {
        let temp = [];
        let objTourType = allThings[obj].type.toLowerCase();
        if (objTourType in sortedAllThings) {   //tour type already exists
            temp = sortedAllThings[objTourType];
        }
        temp.push(allThings[obj]);
        sortedAllThings[objTourType] = temp;
    }
    let resultThings = [];
    for (let i = 0; i < tourTypeList.length; i++) {
        let currentItems = sortedAllThings[tourTypeList[i]];
        resultThings = resultThings.concat(currentItems);
    }

    return resultThings;
}

/** 
 * Generates a complete itinerary object based on the given user preference. Throws errors
 * if invalid argument was provided.
 * 
 * @param userPreferences user preferences object.
 * @returns completeItinerary a complete itinerary object with daily thingsToDo and restaurants.
*/
async function generateCompleteItinerary(userPreferences) {
    //validates number of argument
    if (arguments.length != 1) {
        throw new Error(errorMessages.wrongNumberOfArguments);  
    }
    //validates argument type
    if (typeof userPreferences != "object") {
        throw new Error(errorMessages.itineraryArgumentMissing); 
    }

    //gets thingsToDo and restaurants from the database.
    let destinationObj = await destinationFunctions.getDestinationById(userPreferences.destinationId);
    let allThings = destinationObj.thingsToDo;
    allRestaurants = destinationObj.restaurants;

    allThings.sort(compareTourType);   //sorts the allThings alphabetically by tour type
    let tourTypeList = generateTourTypePriority(userPreferences.tourType);
    let sortedThings = sortThingsByTourType(allThings, tourTypeList);

    totalNumOfDays = userPreferences.numOfDays;
    hourPerDay = userPreferences.hoursPerDay;
    budgetPerDay = userPreferences.maxBudgetPerPerson / userPreferences.numOfDays;

    //calls helper function to generate itinerary
    let completeItinerary = await selectThingsToDo(sortedThings, allRestaurants);

    return completeItinerary;
}

/** 
 * Generates a list of tour type and prioritizes them based on the tour type selected by user.
 * Throws error if invalid argument was provided.
 * 
 * @param tourType the tour type selected by user in string format.
 * @returns array an array of tour types.
*/
function generateTourTypePriority(tourType) {
    //validates number of argument
    if (arguments.length != 1 || typeof tourType != "string") {
        throw new Error(errorMessages.wrongNumberOfArguments);  
    }
    let priorityList = {    //tour type with smaller index has higher priority
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
            destinationId: "5ddfeb603bb0fb359c094fb7",
            tourType: "Historical", //Business, Hiking, Scenic, Adventure, Historical, Sightseeing
            hoursPerDay: 14,    //Relaxed(8 hrs), moderate(10 hrs), high(14 hrs)
            maxBudgetPerPerson: 2000,
            numOfDays: 14,
            numOfTravelers: 5
        };
        var start = new Date().getTime();
        let resultItinerary = await generateCompleteItinerary(userPreferences);
        console.log(resultItinerary);
        var end = new Date().getTime();
        console.log(`generateCompleteItinerary total run time = ${end - start}`);
    } catch (err) {
        console.log(err.message);
    }
}

main();

module.exports = {generateCompleteItinerary};