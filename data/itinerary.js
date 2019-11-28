const location = require('./location');
const destinationFunctions = require('./destinations');
const errorMessages = require('../public/errorMessages');

let allRestaurants = [];
//Make all the budgetNextDay and budgetRemaining variables as global variables so the program run faster?
let budgetPerDay = -1;
let hourPerDay = -1;
let totalNumOfDays = -1
let restaurantBudget = 0.2;

//budget
let excessBudget = 0;
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
function selectRestaurants(allRestaurants, maxBudget, maxRestaurantCount) {
    //validates argumenets type
    if (arguments.length != 3 || !allRestaurants || !maxBudget || !maxRestaurantCount) {
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
        //allThings[thing].group = "thingToDo";
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
 * @param allThings an array of objects with things to do
 * @param maxBudget maximum total budget allotted
 * @param maxTime maximum time allotted
 * @returns 
 */
async function selectThingsToDo(allThings) {
    if (arguments.length != 1 || !allThings) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    
    if (!Array.isArray(allThings)) {
        throw new Error(errorMessages.itineraryArgumentIncorrectType);
    }

    let finalArr = [];
    let dailyItems = [];
    let dailyBudget = budgetPerDay;
    let dailyTime = hourPerDay;
    let dayCount = 1;
    let startOfTheDay = true;
    let startLocation = null;
    let locationDistance = 0;
    let index = 0;
    for (let thing in allThings) {
    // while (dayCount > totalNumOfDays) {
        let restaurants = [];
        if (startOfTheDay) {   //select restaurants for the current day
            let currentRestaurantBudget = dailyBudget * restaurantBudget;
            dailyBudget -= currentRestaurantBudget;
            restaurants = selectRestaurants(allRestaurants, currentRestaurantBudget, 2);
            dailyBudget += excessBudget;
            finalArr["day_" + dayCount] = restaurants;
            startOfTheDay = false;
        }
        let currentItem = allThings[thing];
        let itemCost = currentItem.avgCostPerPerson;
        let itemTime = currentItem.avgTimeSpent;
        // if (startLocation === null) {   //set current day's starting address
        //     startLocation = allThings[thing].location;
        // }
        // let locationDistance = await location.calculateDistanceAddress(startLocation, allThings[thing].location);

        //selects thingsToDo for the current day
        if (dailyBudget >= itemCost && dailyTime >= itemTime) { //within budget
            allThings[thing].group = "thingToDo";
            dailyItems.push(allThings[thing]);
            dailyBudget -= itemCost;
            dailyTime -= itemTime;
            totalSpent += itemCost;
            totalHours += itemTime;
            // allThings.splice(index, 1); //removes visited thing 
        } else {    //out of budget or time, concludes the date
            // finalArr["day_" + dayCount] = dailyItems;
            let tempDay = finalArr["day_" + dayCount];
            finalArr["day_" + dayCount] = tempDay.concat(dailyItems);
            //resets attributes
            dailyItems = []; //clears dailyItems array
            dailyBudget = budgetPerDay + dailyBudget;
            dailyTime = hourPerDay;
            dayCount++;
            startLocation = null;
            startOfTheDay = true; 
        }
        if (dayCount > totalNumOfDays) {  //completes generating all the daily itinerary
            break;
        }
    }
    console.log(finalArr);
    console.log(`totalSpent = ${totalSpent}`);
    console.log(`totalHours = ${totalHours}`);
    return finalArr;
}

/** 
 * Sorts the thingsToDo array based on user's preferred tour type priority.
 * 
 * @param allThings all the unsorted thingsToDo items
 * @param tourTypeList an array with user's 
 * @returns array an array of sorted thingsToDo items
*/
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
    // let restaurants = destinationObj.restaurants;
    allRestaurants = destinationObj.restaurants;

    //is this step necessary? Time efficiency wise?
    allThings.sort(compare);   //sorts the allThings by tour type
    let tourTypeList = generateTourTypePriority(userPreferences.tourType);
    let sortedThings = sortAllThings(allThings, tourTypeList);

    // console.log(JSON.stringify(sortedThings));
    totalNumOfDays = userPreferences.numOfDays;
    hourPerDay = userPreferences.hoursPerDay;
    budgetPerDay = userPreferences.maxBudgetPerPerson / userPreferences.numOfDays;
    // let tempRestaurants = selectRestaurants(restaurants, budgetPerDay / 5, 3);
    // excessBudget = 0;
    let selectedThings = await selectThingsToDo(sortedThings);

}

/** 
 * Generates a list of tour type and prioritizes them based on the tour type selected by user.
 * 
 * @param tourType the tour type selected by user in string format
 * @returns array an array of tour types
*/
function generateTourTypePriority(tourType) {
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
            hoursPerDay: 8,    //Relaxed(8 hrs), moderate(10 hrs), high(14 hrs)
            maxBudgetPerPerson: 2000,
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