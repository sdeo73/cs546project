const location = require('./location');
const destinationFunctions = require('./destinations');
const dbConnection = require('../config/mongoConnection');
const errorMessages = require('../public/errorMessages');

// Array to store the list of places already visited in this itinerary
let visitedThings = [];

/**
 * Knapsack function to pick out things from the input allThings
 * that satisfy the maxBudget and maxTime constraints
 * 
 * @param {*} allThings an array of things to pass as input to knapsack
 * @param {*} maxBudget maximum total budget alloted
 * @param {*} maxTime maximum time alloted
 */
async function putThingsToSack(allThings, maxBudget, maxTime) {
    if(arguments.length != 3 || !allThings || !maxBudget || !maxTime) 
        throw new Error(errorMessages.itineraryArgumentMissing);
    
    if(!Array.isArray(allThings) || Number.isNaN(maxBudget) || Number.isNaN(maxTime))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let thingsToDo = allThings;
    let items = [];
    for (i = 0; i < thingsToDo.length; i++) {
        if(visitedThings.includes(thingsToDo[i].name)){
            continue;
        }
        let thingName = thingsToDo[i].name;
        let avgTime = thingsToDo[i].avgTimeSpent;
        let avgCost = thingsToDo[i].avgCostPerPerson;
        let item = {};
        item[thingName] = avgTime * 1000 + avgCost;
        items.push(item);
    }

    let capacity = maxTime * 1000 + maxBudget;
    let sortByCost = sortSack(capacity, items);
    
    let totalCost = 0;

    console.log(maxBudget);

    for(let i=0; i<sortByCost.length; i++){
        let key = (Object.keys(sortByCost[i]))[0];
        console.log(key+": "+sortByCost[i][key]%100);
        totalCost += sortByCost[i][key]%100;
    }

    console.log("Total: "+totalCost);

    return sortByCost;
}

/**
 * Helper function for knapsack algorithm modified from npm package, knapsack-js.
 * Finds the optimum out of provided items according to capacity.
 * 
 * @param {*} capacity weight parameter to knapsack
 * @param {*} items the list of items to sort as per knapsack algorithm
 */
function sortSack(capacity, items) {
    if(arguments.length != 2 || !capacity || !items)
        throw new Error(errorMessages.itineraryArgumentMissing);
    
    if(Number.isNaN(capacity) || !Array.isArray(items))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    var result  = [],
        leftCap = capacity,
        itemsFiltered;

    // Resolve
    var item,
        itemKey,
        itemVal,
        itemObj;

    itemsFiltered = items.filter(function(value) {
      itemVal = (typeof value === 'object') ? value[Object.keys(value)[0]] : null;
      if(!isNaN(itemVal) && itemVal > 0 && itemVal <= capacity) {
        return true;
      } else {
        return false;
      }
    });
    itemsFiltered.sort(function(a, b) { 
        return a[Object.keys(a)[0]] >= b[Object.keys(b)[0]]; 
    });

    for(item in itemsFiltered) {
      if(itemsFiltered.hasOwnProperty(item)) {
        itemKey = Object.keys(itemsFiltered[item])[0];
        itemVal = itemsFiltered[item][itemKey];

        if((leftCap-itemVal) >= 0) {
          leftCap = leftCap-itemVal;

          itemObj = Object.create(null);
          itemObj[itemKey] = itemVal;
          result.push(itemObj);

          delete itemsFiltered[item];

          if(leftCap <= 0) break;
        }
      }
    }

    return result;
}

/**
 * Find the location nearest to thingToDo from the thingsToDo array.
 * This is a helper function for itinerary generation.
 * 
 * @param {*} thingToDo Source location
 * @param {*} thingsToDo List of possible destination locations
 * @param {*} destinationObject The main destination object from the collection
 */
async function getNearestThingToDo(thingToDo, thingsToDo, destinationObject){
    if(arguments.length != 3 || !thingsToDo || !thingsToDo || !destinationObject)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if(typeof thingsToDo !== 'object' || !Array.isArray(thingsToDo) || typeof destinationObject !== 'object')
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let thing = (Object.keys(thingToDo))[0];
    let allThings = destinationObject.thingsToDo;
    let thingObject = allThings.find(x => x.name === thing);
    thingAddress = thingObject.location;
    let minThing = ""; 
    let minDistance = -1;

    for(let i=0; i<thingsToDo.length; i++){
        let currentThing = Object.keys(thingsToDo[i]);
        currentThing = currentThing[0];
        if(currentThing == thing || visitedThings.includes(currentThing)){
            continue;
        }
        currentThing = allThings.find(newThing => newThing.name === currentThing);
        let distance = await location.calculateDistanceAddress(thingAddress, currentThing.location);
        if(minDistance == -1){
            minDistance = distance;
            minThing = currentThing.name;
        }else if(minDistance > distance){
            minDistance = distance;
            minThing = currentThing.name;
        }
    }
    return minThing;
}

/**
 * 
 * @param {*} destinationObject 
 * @param {*} maxTime 
 * @param {*} maxBudget 
 * @param {*} noOfTravellers 
 */
async function generateSingleDayItinerary(destinationObject, maxTime, maxBudget, noOfTravellers){
    if(arguments.length != 4 || !destinationObject || !maxTime || !maxBudget || !noOfTravellers)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if(typeof destinationObject != 'object' || Number.isNaN(maxTime) || Number.isNaN(maxBudget) || !Number.isInteger(noOfTravellers))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let itineraryThisDay = [];

    if(maxTime < 1 || maxBudget <1){
        return itineraryThisDay;
    }

    let allThings = destinationObject.thingsToDo;
    let possibleThingsToDo = await putThingsToSack(allThings, maxBudget, maxTime);
    let nearestThingObj = possibleThingsToDo[0];
    let nearestThing = (Object.keys(nearestThingObj))[0];
    visitedThings.push(nearestThing);
    let cost = possibleThingsToDo[0][nearestThing] % 100;
    let time = Math.round(possibleThingsToDo[0][nearestThing] / 1000);
    let location = (allThings.find(x => x.name == nearestThing)).location;
    let item = {
        "name": nearestThing,
        "location": location,
        "avgCost": cost*noOfTravellers,
        "avgTimeSpent": time
    }
    itineraryThisDay.push(item);
    let nearestIndex = possibleThingsToDo.findIndex(
        x => {
            let keys = Object.keys(x);
            return (keys[0] == nearestThing);
        }
    );
    
    for(let i=0; i<possibleThingsToDo.length; i++){
        nearestThing = await getNearestThingToDo(nearestThingObj, possibleThingsToDo, destinationObject);

        if(visitedThings.includes(nearestThing)){
            continue;
        }

        if(nearestThing === ""){
            continue;
        }

        nearestIndex = possibleThingsToDo.findIndex(
            x => {
                let keys = Object.keys(x);
                return (keys[0] == nearestThing);
            }
        );

        cost = possibleThingsToDo[nearestIndex][nearestThing] % 100;
        time = Math.round(possibleThingsToDo[nearestIndex][nearestThing] / 1000);
        nearestThingObj = possibleThingsToDo[nearestIndex];
        location = (allThings.find(x => x.name == nearestThing)).location;
        
        item = {
            "name": nearestThing,
            "location": location,
            "avgCost": cost*noOfTravellers,
            "avgTimeSpent": time
        }
        
        itineraryThisDay.push(item);
        visitedThings.push(nearestThing);
    }
    return itineraryThisDay;
}

/**
 * 
 * @param {*} destinationId MongoDB ID of the destination document to generate itinerary for
 * @param {*} timePerDay Depends on the tour activity selected
 * @param {*} maxBudgetPerPerson Maximimum budget for one person for the duration of the trip
 * @param {*} noOfDays No. of days to travel
 * @param {*} noOfTravellers No. of people travelling
 */
async function generateCompleteItinerary(destinationId, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers){
    if(arguments.length != 5 || !destinationId || !timePerDay || !maxBudgetPerPerson || !noOfDays || !noOfTravellers)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if(typeof destinationId !== 'string' || Number.isNaN(timePerDay) || Number.isNaN(maxBudgetPerPerson) || !Number.isInteger(noOfDays) || !Number.isInteger(noOfTravellers))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let destinationObject = await destinationFunctions.getDestinationById(destinationId);
    const budgetPerDay = maxBudgetPerPerson*noOfTravellers / noOfDays;
    let budgetNextDay = budgetPerDay;
    let budgetRemaining = budgetNextDay;
    
    finalItinerary = {};

    for(let i=0; i<noOfDays; i++){
        console.log("\nday_"+(i+1)+"\n");
        let itineraryThisDay = await generateSingleDayItinerary(destinationObject, timePerDay, budgetNextDay/noOfTravellers, noOfTravellers);
        budgetRemaining = budgetNextDay;
        console.log(budgetNextDay);

        for(let j=0; j<itineraryThisDay.length; j++){
            budgetRemaining -= itineraryThisDay[j].avgCost;
        }

        console.log(budgetRemaining)

        budgetNextDay = budgetRemaining + budgetPerDay;

        finalItinerary["day_"+(i+1)] = itineraryThisDay;
    }

    return finalItinerary;
}

async function getNearestThingToDoNoKnapSack(thingToDo, thingsToDo, destinationObject, thingsToIgnore){
    if(arguments.length != 4 || !thingsToDo || !thingsToDo || !destinationObject)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if(typeof thingsToDo !== 'object' || !Array.isArray(thingsToDo) || typeof destinationObject !== 'object')
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let thing = thingToDo.name;
    let allThings = destinationObject.thingsToDo;
    let thingObject = allThings.find(x => x.name === thing);
    thingAddress = thingObject.location;
    let minThing = ""; 
    let minDistance = -1;

    for(let i=0; i<thingsToDo.length; i++){
        let currentThing = thingsToDo[i].name;
        
        if(currentThing == thing || visitedThings.includes(currentThing) || thingsToIgnore.includes(currentThing)){
            continue;
        }
        currentThing = allThings.find(newThing => newThing.name === currentThing);
        let distance = await location.calculateDistanceAddress(thingAddress, currentThing.location);
        if(minDistance == -1){
            minDistance = distance;
            minThing = currentThing.name;
        }else if(minDistance > distance){
            minDistance = distance;
            minThing = currentThing.name;
        }

        if(minDistance < 1)
            break;
    }
    return minThing;
}

async function generateSingleDayItineraryNoKnapSack(destinationObject, maxTime, maxBudget, noOfTravellers){
    let itineraryThisDay = [];
    let timeRemaining = maxTime;
    let budgetRemaining = maxBudget;


    if(maxTime < 1 || maxBudget <1){
        return itineraryThisDay;
    }

    let allThings = destinationObject.thingsToDo;

    let nearestThing = allThings[0];

    let i = 1; 

    while(visitedThings.includes(nearestThing.name)){
        nearestThing = allThings[i];
        i++;
    }

    let currentThingCost = nearestThing.avgCostPerPerson * noOfTravellers;
    let currentThingTime = nearestThing.avgTimeSpent

    let item = {
        "name": nearestThing.name,
        "location": nearestThing.location,
        "avgCost": currentThingCost,
        "avgTimeSpent": currentThingTime
    };

    budgetRemaining -= item.avgCost;
    timeRemaining -= item.avgTimeSpent;

    visitedThings.push(item.name);
    itineraryThisDay.push(item);

    let notPossibleThisDay = [];

    while(budgetRemaining > 0 && timeRemaining > 0){
        
        nearestThingName = await getNearestThingToDoNoKnapSack(nearestThing, allThings, destinationObject, notPossibleThisDay);
        
        if((allThings.length - visitedThings.length) <= notPossibleThisDay.length){
            break;
        }

        if(visitedThings.includes(nearestThingName)){
            continue;
        }

        if(nearestThingName === ""){
            continue;
        }

        nearestThing = allThings.find(x => x.name == nearestThingName);
        currentThingCost = nearestThing.avgCostPerPerson * noOfTravellers;
        currentThingTime = nearestThing.avgTimeSpent;

        if(budgetRemaining - currentThingCost < 0 || timeRemaining - currentThingTime < 0){
            notPossibleThisDay.push(nearestThingName);
            continue;
        }

        item = {
            "name": nearestThing.name,
            "location": nearestThing.location,
            "avgCost": currentThingCost,
            "avgTimeSpent": currentThingTime
        };

        budgetRemaining -= item.avgCost;
        timeRemaining -= item.avgTimeSpent;

        visitedThings.push(item.name);
        itineraryThisDay.push(item);

        // console.log(JSON.stringify(itineraryThisDay, null, 2));
        // console.log(budgetRemaining + " - " + timeRemaining);

    }

    // console.log(JSON.stringify(itineraryThisDay, null, 2));

    return itineraryThisDay;
}

async function generateCompleteItineraryNoKnapSack(destinationId, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers){
    if(arguments.length != 5 || !destinationId || !timePerDay || !maxBudgetPerPerson || !noOfDays || !noOfTravellers)
        throw new Error(errorMessages.itineraryArgumentMissing);

    if(typeof destinationId !== 'string' || Number.isNaN(timePerDay) || Number.isNaN(maxBudgetPerPerson) || !Number.isInteger(noOfDays) || !Number.isInteger(noOfTravellers))
        throw new Error(errorMessages.itineraryArgumentIncorrectType);

    let destinationObject = await destinationFunctions.getDestinationById(destinationId);
    const budgetPerDay = maxBudgetPerPerson * noOfTravellers / noOfDays;
    let budgetNextDay = budgetPerDay;
    let budgetRemaining = budgetNextDay;
    
    finalItinerary = {};

    for(let i=0; i<noOfDays; i++){
        // console.log("\nday_"+(i+1)+"\n");
        let itineraryThisDay = await generateSingleDayItineraryNoKnapSack(destinationObject, timePerDay, budgetNextDay, noOfTravellers);
        budgetRemaining = budgetNextDay;
        // console.log(budgetNextDay);

        for(let j=0; j<itineraryThisDay.length; j++){
            budgetRemaining -= itineraryThisDay[j].avgCost;
        }

        // console.log(budgetRemaining)

        budgetNextDay = budgetRemaining + budgetPerDay;

        finalItinerary["day_"+(i+1)] = itineraryThisDay;
    }

    return finalItinerary;
}

async function main(){
    try {
        // console.log(await generateCompleteItinerary('5ddc4e05eafd576ed8797b70', 10, 1000 , 14, 5));
        console.log(await generateCompleteItineraryNoKnapSack('5ddc4e05eafd576ed8797b70', 10, 1000 , 5, 5))
        const db = await dbConnection();
        await db.serverConfig.close();
    } catch (error) {
        console.log(error);
    }
}

main();

module.exports = {generateCompleteItinerary};