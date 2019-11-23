const dubai = require('./Destination/dubai');
const location = require('./location');

let visitedThings = [];

async function putThingsToSack(allThings, maxBudget, maxTime) {
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
    let sortByCost = sortSack2(capacity, items);

    return sortByCost;
}

function sortSack2(capacity, items) {
    var result  = [],
        leftCap = capacity,
        itemsFiltered;

    if(typeof capacity !== 'number')
      return false;

    if(!items || !(items instanceof Array))
      return false;

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

async function getThingsToDo(destinationFilePath) {
    const destination = await require(destinationFilePath);
    let thingsToDo = destination.thingsToDo;

    return thingsToDo;
}

async function getNearestThingToDo(thingToDo, thingsToDo){
    let thing = Object.keys(thingToDo);
    thing = thing[0];
    let thingObject = dubai.thingsToDo.find(x => x.name === thing);
    thingAddress = thingObject.location;
    let minThing = ""; 
    let minDistance = -1;

    for(let i=0; i<thingsToDo.length; i++){
        let currentThing = Object.keys(thingsToDo[i]);
        currentThing = currentThing[0];
        currentThing = dubai.thingsToDo.find(newThing => newThing.name === currentThing);
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

async function getItineraryDay(destinationFilePath, maxTime, maxBudget, noOfTravellers){
    let itineraryThisDay = [];

    if(maxTime < 1 || maxBudget <1){
        return itineraryThisDay;
    }

    let allThings = await getThingsToDo(destinationFilePath);
    let possibleThingsToDo = await putThingsToSack(allThings, maxBudget, maxTime);
    let nearestThingObj = possibleThingsToDo[0];
    let nearestThing = Object.keys(nearestThingObj);
    nearestThing = nearestThing[0];
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
    let thisIndex = possibleThingsToDo.findIndex(
        x => {
            let keys = Object.keys(x);
            return (keys[0] == nearestThing);
        }
    );
    possibleThingsToDo.splice(thisIndex, 1);
    
    for(let i=0; i<possibleThingsToDo.length; i++){
        nearestThing = await getNearestThingToDo(nearestThingObj, possibleThingsToDo);

        thisIndex = possibleThingsToDo.findIndex(
            x => {
                let keys = Object.keys(x);
                return (keys[0] == nearestThing);
            }
        );
        cost = possibleThingsToDo[thisIndex][nearestThing] % 100;
        time = Math.round(possibleThingsToDo[thisIndex][nearestThing] / 1000);
        nearestThingObj = possibleThingsToDo[thisIndex];
        possibleThingsToDo.splice(thisIndex, 1);
        location = (allThings.find(x => x.name == nearestThing)).location;
        
        item = {
            "name": nearestThing,
            "location": location,
            "avgCost": cost*noOfTravellers,
            "avgTimeSpent": time
        }
        
        nearestThing = Object.keys(nearestThingObj);
        nearestThing = nearestThing[0];
        itineraryThisDay.push(item);
        visitedThings.push(nearestThing);
    }
    return itineraryThisDay;
}

async function generateItinerary(destinationFilePath, timePerDay, maxBudgetPerPerson, noOfDays, noOfTravellers){
    const budgetPerDay = maxBudgetPerPerson*noOfTravellers / noOfDays;
    let budgetNextDay = budgetPerDay;
    let budgetRemaining = budgetNextDay;
    
    finalItinerary = {};

    for(let i=0; i<noOfDays; i++){
        let itineraryThisDay = await getItineraryDay(destinationFilePath, timePerDay, budgetNextDay, noOfTravellers);
        budgetRemaining = budgetNextDay;

        for(let j=0; j<itineraryThisDay.length; j++){
            budgetRemaining -= itineraryThisDay[i].avgCost;
        }

        budgetNextDay = budgetRemaining + budgetPerDay;

        finalItinerary["day_"+(i+1)] = itineraryThisDay;
    }

    return finalItinerary;
}

async function main(){
    try {
        let finalItinerary = await generateItinerary('./Destination/dubai', 10, 1000, 3, 5);
        console.log(finalItinerary);
    } catch (error) {
        console.log(error);
    }
}

main();

module.exports = {getItineraryDay};