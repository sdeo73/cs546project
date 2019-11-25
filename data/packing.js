const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const packing = mongoCollections.packing;
const errorMessages = require('../public/errorMessages');
const destination = require('../data/destinations');
const packingList = require('../data/Destination/packingList');

/** 
 * Creates a new packing list and adds it into the packing collection. Throws errors if 
 * invalid argument(s) was provided, query failed or the packing list already
 * exists in the packing collection.
 * 
 * @param type the packing type in string format
 * @param items an array of items
 * @returns boolean indicates whether packing list was created successfully or not
*/
async function createPackingList(type, items){
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument(s) type
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string' || !Array.isArray(items)) throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();
    let newList = {
        type: type,
        items: items
    };

    const listExists = await packingCollection.findOne({"type" : type});
    //checks if packing list exists already or not
    if(listExists) throw new Error(errorMessages.packingListAlreadyExists);
    //adds the new packing list into database
    const insertInfo = await packingCollection.insertOne(newList);
    if(insertInfo == null || insertInfo.insertedCount === 0) throw new Error(errorMessages.packingListAddError);

    return true;
}

/** 
 * Gets a specific packing list from the packing collection. Throws errors if 
 * invalid argument(s) was provided or query failed.
 * 
 * @param type the packing type in string format
 * @returns array an array of items of the specific packing list
*/
async function getPackingList(type){
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument(s) type
    if(!type) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();

    const packingList = await packingCollection.findOne({"type": type});

    if(!packingList) throw new Error(errorMessages.packingListNotFound);

    return packingList.items;
}

/** 
 * Adds a new item or an array of items into the packing collection. 
 * Throws errors if invalid arguments were provided, or query failed.
 * 
 * @param type the packing type in string format
 * @param items an array of items or a single string item
 * @returns boolean indicates whether packing list was created successfully or not
*/
async function addItemsToPackingList(type, items){
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument(s) type
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    if(typeof items == 'string'){ //the passed-in items is a sigle string item
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: items}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

        return true;
    }else if(Array.isArray(items)){ //the passed-in items is an array of items
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: {$each: items}}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

        return true;
    }else{  //the passed-in items is invalid type
        throw new Error(errorMessages.packingListArgumentTypeError);
    }
}

/** 
 * Deletes an entire packing list from the packing collection. 
 * Throws errors if invalid arguments were provided, or query failed.
 * 
 * @param type the packing type in string format
 * @returns boolean indicates whether packing list was deleted successfully or not
*/
async function deletePackingList(type){
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument(s) type
    if(!type) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();
    const deletionInfo = await packingCollection.removeOne({"type": type});

    if(!deletionInfo || deletionInfo.deletedCount ==0) throw new Error(errorMessages.packingListDeleteFailed);

    return true;
}

/** 
 * Removes an item or an array of items from a specific packing list of the packing collection. 
 * Throws errors if invalid arguments were provided, or query failed.
 * 
 * @param type the packing type in string format
 * @param items an array of items or a single string item
 * @returns boolean indicates whether the items was removed successfully or not
*/
async function removeItemsFromPackingList(type, items){
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument(s) type
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    if(typeof items == 'string'){   //the passed-in items is a sigle string item
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: items}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else if(Array.isArray(items)){ //the passed-in items is an array of items
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: {$in: items}}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else{  //the passed-in items is invalid type
        throw new Error(errorMessages.packingListArgumentTypeError);
    }
}

/** 
 * Generates a list of items for packing based on the passed-in arguments.
 * 
 * @param travelDates
 * @param destinationObj
 * @param tourType
 * @returns array an array of string with all the items needed for packing list
*/
async function generatePackingList(travelDates, destinationObj, tourType) {
    //validates number of arguments
    if (arguments.length != 3) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates arguments'type
    if (!travelDates || typeof(travelDates) != "object" || travelDates.start === undefined || travelDates.end === undefined) {
        throw new Error(errorMessages.travelDatesMissing);
    }
    if (!destinationObj || typeof(destinationObj) != "object") {
        throw new Error(errorMessages.InvalidDestinationObject);
    }
    if (!tourType || !Array.isArray(tourType)) {
        throw new Error(errorMessages.tourTypeMissing);
    }

    //finds the weather data such as rain, maximum and minimum temperature
    let hasRain = false;    //indicate whether the destination rains or not
    let allWeather = destinationObj.weather;    //an array of the destination's monthly weather data
    let startDate = new Date(travelDates.start);
    let endDate = new Date(travelDates.end);
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();
    let startMonth = startDate.getMonth();
    let endMonth = endDate.getMonth();
    //checks if the date strings provided were valid or not
    if (isNaN(startYear) || isNaN(endYear) || isNaN(startMonth) || isNaN(endMonth)) { 
        throw new Error(errorMessages.InvalidDateFormat);
    }
    //need to check invalid date format such as: 11/31/2019 or 02/29/2019
    if (!validateDate(travelDates.start) || !validateDate(travelDates.end)) {
        throw new Error(errorMessages.InvalidDateFormat);
    }
    
    let yearDiff = endYear - startYear;
    let monthsArr = []; //integer array used to store all the months' index covered by the itinerary
    if (yearDiff < 0) { //endDate happens before startDate
        throw new Error(errorMessages.InvalidDateFormat);
    } else if (yearDiff > 1) { //all months are covered between startDate and endDate. e.g. 12/31/2019~04/05/2023
        monthsArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    } else if (yearDiff == 1) { //startDate and endDate have one year gap. e.g. 12/31/2019~02/23/2021
        for (let i = startMonth; i < 12; i++) { //startDate's month to December
            monthsArr.push(i);
        }
        for (let j = 0; j <= endMonth; j++) {   //january to endDate's month
            monthsArr.push(j);
        }
    } else {    //startDate and endDate have the same year. e.g. e.g. 05/29/2019~07/23/2019
        for (let i = startMonth; i <= endMonth; i++) {
            monthsArr.push(i);
        }
    }

    let minTemp;    //lowest temperature of the destination
    let maxTemp;    //highest temperature of the destination
    let summerTemp = 25;    //temperature for summer packing list
    let winterTemp = 10;    //temperature for winter packing list
    
    //scans through the monthsArr to get the weather data
    for (var i in monthsArr) {
        let currentMonth = allWeather[monthsArr[i]];   //gets the current month weather data
        if (currentMonth.rain) {  //the destination has rain
            hasRain = true;
        }
        if (currentMonth.avgHigh > maxTemp) {   //found higher maxTemp
            maxTemp = currentMonth.avgHigh;
        } else if (maxTemp === undefined) {     //initializes maximum temperature
            maxTemp = currentMonth.avgHigh;
        }
        if (currentMonth.avgLow < minTemp) {    //found lower minTemp
            minTemp = currentMonth.avgLow;
        } else if (minTemp === undefined) {     //initializes minimum temperature
            minTemp = currentMonth.avgLow;
        }
    }

    //creates the final packing list
    let finalPack = await getPackingList("basic");   //all itinerary would have "basic" packing list
    //determines whether to append "summer" or "winter" packing items
    if (minTemp <= winterTemp) {    //winter packing list
        finalPack = finalPack.concat(await getPackingList("winter"));
    }
    if (maxTemp >= summerTemp) {    //summer packing list
        finalPack = finalPack.concat(await getPackingList("summer"));
    }
    //determines to append "rain" packing items or not
    if (hasRain) {
        finalPack = finalPack.concat(await getPackingList("rain"));
    }
    //checks tour type array
    for (let type in tourType) {
        //the current tour type might not have a corresponding packing list
        let currentType = tourType[type].toLocaleLowerCase(); //packingList.json store type name in lower case
        if (currentType === "business") {
            finalPack = finalPack.concat(await getPackingList(currentType));
        }
        if (currentType === "hiking") {
            finalPack = finalPack.concat(await getPackingList(currentType));
        }
    }
    return finalPack;
}

/** 
 * Returns true if the passed-in date string is valid after parsing to new Date, else
 * returns false.
 * 
 * @param dateString the string to be parsed into date and validated
 * @returns boolean indicates whether the passed-in string date is valid or not
*/
function validateDate(dateString) {
    let inputDate = dateString.split("/");
    let newDate = new Date(dateString);
    //checks if the date strings provided were valid or not
    if (isNaN(newDate.getFullYear()) || isNaN(newDate.getMonth()) || isNaN(newDate.getDate())) { 
        return false;
    }
    //validates if the date is parsed correctly
    if ((newDate.getMonth() + 1) == inputDate[0] && newDate.getDate() == inputDate[1] && newDate.getFullYear() == inputDate[2]) {
        return true;
    }
    return false;
}

module.exports = {createPackingList, getPackingList, addItemsToPackingList, deletePackingList, removeItemsFromPackingList, generatePackingList};


