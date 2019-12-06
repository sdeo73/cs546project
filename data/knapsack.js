const location = require('./location');
const destinationFunctions = require('./destinations');
const dbConnection = require('../config/mongoConnection');
const errorMessages = require('../public/errorMessages');

// Array to store the list of places already visited in this itinerary
let visitedThings = [];

/**
 * Generates an array of things to do based on the given two constraints: maximum budget and time (hours per day).
 * Throws errors if invalid arguments were given or empty array is generated.
 * 
 * @param allThings an array of objects with things to do
 * @param maxBudget maximum total budget allotted
 * @param maxTime maximum time allotted
 * @returns 
 */
async function generateThingsToDo(allThings, maxBudget, maxTime) {
    if (arguments.length != 3 || !allThings || !maxBudget || !maxTime) {
        throw new Error(errorMessages.itineraryArgumentMissing);
    }
    
    if (!Array.isArray(allThings) || Number.isNaN(maxBudget) || Number.isNaN(maxTime))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let thingsToDo = allThings;
    let items = [];
    for (i = 0; i < thingsToDo.length; i++) {
        if (visitedThings.includes(thingsToDo[i].name)) {
            continue;
        }
        let thingName = thingsToDo[i].name;
        let avgTime = thingsToDo[i].avgTimeSpent;
        let avgCost = thingsToDo[i].avgCostPerPerson;
        let item = {};
        item[thingName] = avgTime;
        item["avgCost"] = avgCost;
        items.push(item);
    }
    let finalItems = selectItems(maxTime, maxBudget, items);
    
    //throws error if sortByCost is empty???
    return finalItems;
}

/**
 * Helper function that uses the knapsack algorithm to select the optimal things to do object
 * within the given constraint(s).
 * 
 * @param timeLimit the maximum number of hours
 * @param budgetLimit
 * @param items the list of items to sort as per knapsack algorithm
 */
function selectItems(timeLimit, budgetlimit, items) {
    if (arguments.length != 3) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //need to validate arguments types

    var result  = [],
        leftCap = timeLimit,
        leftBudget = budgetlimit,
        itemsFiltered;
    //validates arguments
    if(typeof timeLimit !== 'number')
        return false;
    if(!items || !(items instanceof Array))
        return false;

    // Resolve
    var item,
        itemKey1,
        itemKey2,
        itemTime,
        itemCost,
        itemObj;
    itemsFiltered = items.filter(function(value) {
        itemTime = (typeof value === 'object') ? value[Object.keys(value)[0]] : null;
        itemCost = (typeof value === 'object') ? value[Object.keys(value)[1]] : null;
        if(!isNaN(itemTime) && itemTime > 0 && itemTime <= timeLimit && !isNaN(itemCost) && itemCost >= 0 && itemCost <= budgetlimit) {
            return true;
        } else {
            return false;
        }
    });
    itemsFiltered.sort(function(a, b) { 
        return a[Object.keys(a)[1]] >= b[Object.keys(b)[1]];
    });
    for(item in itemsFiltered) {
        if(itemsFiltered.hasOwnProperty(item)) {
            itemKey1 = Object.keys(itemsFiltered[item])[0];
            itemKey2 = Object.keys(itemsFiltered[item])[1];
            itemTime = itemsFiltered[item][itemKey1];
            itemCost = itemsFiltered[item][itemKey2];
            
            if((leftCap - itemTime) >= 0 && (leftBudget - itemCost) >= 0) {
                leftCap = leftCap - itemTime;
                leftBudget = leftBudget - itemCost;
                itemObj = Object.create(null);
                itemObj[itemKey1] = itemTime;
                itemObj[itemKey2] = itemCost;
                result.push(itemObj);
                delete itemsFiltered[item];
        
                if(leftCap <= 0) break;
                if(leftBudget <= 0) break;
            }
        }
    }

    return result;
}

/**
 * Finds the nearest location to singleThing from the thingsToDo array.
 * This is a helper function for itinerary generation.
 * 
 * @param singleThing Source location
 * @param thingsToDo List of possible destination locations
 * @param destinationObj The main destination object from the collection
 */
async function getNearestThingToDo(singleThing, thingsToDo, destinationObj) {
    if (arguments.length != 3 || !thingsToDo || !thingsToDo || !destinationObj)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if (typeof thingsToDo !== 'object' || !Array.isArray(thingsToDo) || typeof destinationObj !== 'object')
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let thing = (Object.keys(singleThing))[0];
    let allThings = destinationObj.thingsToDo;
    let thingObject = allThings.find(x => x.name === thing);
    thingAddress = thingObject.location;
    let minThing = ""; 
    let minDistance = -1;

    for (let i = 0; i < thingsToDo.length; i++) {
        let currentThing = Object.keys(thingsToDo[i]);
        currentThing = currentThing[0];
        if (currentThing == thing) {
            continue;
        }
        currentThing = allThings.find(newThing => newThing.name === currentThing);
        let distance = await location.calculateDistanceAddress(thingAddress, currentThing.location);
        if (minDistance == -1) {
            minDistance = distance;
            minThing = currentThing.name;
        }else if (minDistance > distance) {
            minDistance = distance;
            minThing = currentThing.name;
        }
    }
    return minThing;
}

/**
 * Generates a single day itinerary with the provided destination info, number of hours, budget,
 * and number of travelers.
 * 
 * @param destinationObj destination object that consists all the thingsToDo and restaurants data
 * @param maxTime maximum number of hours available for the current day
 * @param maxBudget maximum budget of current day's itinerary
 * @param noOfTravellers number of travelers
 */
async function generateSingleDayItinerary(destinationObj, maxTime, maxBudget, noOfTravellers) {
    if (arguments.length != 4 || !destinationObj || !maxTime || !maxBudget || !noOfTravellers)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if (typeof destinationObj != 'object' || Number.isNaN(maxTime) || Number.isNaN(maxBudget) || !Number.isInteger(noOfTravellers))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let itineraryThisDay = [];

    if (maxTime < 1 || maxBudget < 1) {
        return itineraryThisDay;
    }

    let allThings = destinationObj.thingsToDo;
    let possibleThingsToDo = await generateThingsToDo(allThings, maxBudget, maxTime);
    let nearestThingObj = possibleThingsToDo[0];
    let nearestThing = (Object.keys(nearestThingObj))[0];
    visitedThings.push(nearestThing);
    let cost = possibleThingsToDo[0]["avgCost"];
    let time = Math.round(possibleThingsToDo[0][nearestThing]);

    let location = (allThings.find(x => x.name == nearestThing)).location;
    let item = {
        "name": nearestThing,
        "location": location,
        "avgCost": cost, //or cost * noOfTravellers???
        "avgTimeSpent": time
    }
    itineraryThisDay.push(item);
    let nearestIndex = possibleThingsToDo.findIndex(
        x => {
            let keys = Object.keys(x);
            return (keys[0] == nearestThing);
        }
    );
    //removes the first element (starting point)
    possibleThingsToDo.splice(nearestIndex, 1);
    while (possibleThingsToDo.length > 0) {
        nearestThing = await getNearestThingToDo(nearestThingObj, possibleThingsToDo, destinationObj);

        if (visitedThings.includes(nearestThing)) {
            continue;
        }
        if (nearestThing === "") {
            continue;
        }
        nearestIndex = possibleThingsToDo.findIndex(
            x => {
                let keys = Object.keys(x);
                return (keys[0] == nearestThing);
            }
        );

        cost = possibleThingsToDo[nearestIndex]["avgCost"];
        time = Math.round(possibleThingsToDo[nearestIndex][nearestThing]);
        nearestThingObj = possibleThingsToDo[nearestIndex];
        location = (allThings.find(x => x.name == nearestThing)).location;
        
        item = {
            "name": nearestThing,
            "location": location,
            "avgCost": cost,    //or cost * noOfTravellers???
            "avgTimeSpent": time
        }
        //removed the visited place
        possibleThingsToDo.splice(nearestIndex, 1);
        itineraryThisDay.push(item);
        visitedThings.push(nearestThing);
    }
    return itineraryThisDay;
}

/**
 * Generates a complete daily itinerary based on the given destination, number of days, hours per day,
 * travelers, and budget. Throws error if invalid arguments are provided  
 * 
 * @param destinationId a specific id of a destination within the destinations collection
 * @param timePerDay maximum number of hours available for each day's itinerary
 * @param maxBudgetPerPerson maximum budget per person for the whole trip
 * @param noOfDays number of days for the whole trip
 * @param noOfTravellers total number of people user is traveling with
 * @returns finalItinerary an object with daily itinerary in it.
 */
async function generateCompleteItinerary(destinationId, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers) {
    if (arguments.length != 5 || !destinationId || !timePerDay || !maxBudgetPerPerson || !noOfDays || !noOfTravellers)
        throw new Error(errorMessages.itineraryArgumentMissing);    
    //why use isNaN and isInteger at the same time?
    if (typeof destinationId !== 'string' || Number.isNaN(timePerDay) || Number.isNaN(maxBudgetPerPerson) || !Number.isInteger(noOfDays) || !Number.isInteger(noOfTravellers))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let destinationObj = await destinationFunctions.getDestinationById(destinationId);
    const budgetPerDay = maxBudgetPerPerson / noOfDays;
    let budgetNextDay = budgetPerDay;
    let budgetRemaining = budgetNextDay;
    
    finalItinerary = {};

    let totalSpent = 0;
    let totalHours = 0;
    for (let i = 0; i < noOfDays; i++) {
        console.log(`---------- Start of Day${i+1} --------------`);
        console.log(`top budgetPerDay = ${budgetPerDay}`);
        console.log(`top budgetNextDay = ${budgetNextDay}`);
        console.log(`top budgetRemaining = ${budgetRemaining}`);
        let itineraryThisDay = await generateSingleDayItinerary(destinationObj, timePerDay, budgetNextDay, noOfTravellers);
        //should we check if itineraryThisDay is empty or not?
        budgetRemaining = budgetNextDay;

        let totalDailySpending = 0;
        let totalDailyHours = 0
        for (let j = 0; j < itineraryThisDay.length; j++) {
            //daily spending
            budgetRemaining -= itineraryThisDay[j].avgCost;
            totalDailySpending += itineraryThisDay[j].avgCost;
            totalSpent += itineraryThisDay[j].avgCost;
            //daily hours
            totalDailyHours += itineraryThisDay[j].avgTimeSpent;
            totalHours += itineraryThisDay[j].avgTimeSpent;
        }

        budgetNextDay = budgetRemaining + budgetPerDay;

        finalItinerary["day_"+(i+1)] = itineraryThisDay;
        console.log(`bottom budgetPerDay = ${budgetPerDay}`);
        console.log(`bottom budgetNextDay = ${budgetNextDay}`);
        console.log(`bottom budgetRemaining = ${budgetRemaining}`);
        console.log(`Total Spent Today_${i+1} = ${totalDailySpending}`);
        console.log(`Total Hours Today_${i+1} = ${totalDailyHours} `);
    }

    console.log(`Entire Trip Cost = ${totalSpent}`);
    console.log(`Entire Trip Hours = ${totalHours}`);
    return finalItinerary;
}

// async function main() {
//     try {
//         //Test_Case_01: "10, 1000, 14, 5"
//         var start = new Date().getTime();
//         let itinerary = await generateCompleteItinerary("5ddc1481de423423bcb33e33", 10, 1000, 14, 5);
//         console.log(itinerary);
//         var end = new Date().getTime();
//         console.log(`Start time = ${start}`);
//         console.log(`End time = ${end}`);
//         console.log(`generateCompleteItinerary function took: ${end - start} milliseconds.`);
//     } catch (err) {
//         console.log(err.message);
//     }
// }

// main();

module.exports = {generateCompleteItinerary};