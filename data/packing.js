const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const packing = mongoCollections.packing;
const errorMessages = require('../public/errorMessages');
const destination = require('../data/destinations');
const packingList = require('../data/Destination/packingList');

async function createPackingList(type, items){
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string' || !Array.isArray(items)) throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();

    let newList = {
        type: type,
        items: items
    };

    const listExists = await packingCollection.findOne({"type" : type});

    if(listExists) throw new Error(errorMessages.packingListAlreadyExists);

    const insertInfo = await packingCollection.insertOne(newList);

    if(insertInfo == null || insertInfo.insertedCount === 0) throw new Error(errorMessages.packingListAddError);

    return true;

}

async function getPackingList(type){
    if(!type) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();

    const packingList = await packingCollection.findOne({"type": type});

    if(!packingList) throw new Error(errorMessages.packingListNotFound);

    return packingList.items;
}

async function addItemsToPackingList(type, items){
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    if(typeof items == 'string'){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: items}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: {$each: items}}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

        return true;
    }else{
        throw new Error(errorMessages.packingListArgumentTypeError);
    }
}

async function deletePackingList(type){
    if(!type) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    const packingCollection = await packing();
    const deletionInfo = await packingCollection.removeOne({"type": type});

    if(!deletionInfo || deletionInfo.deletedCount ==0) throw new Error(errorMessages.packingListDeleteFailed);

    return true;
}

async function removeItemsFromPackingList(type, items){
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    if(typeof items == 'string'){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: items}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: {$in: items}}});

        if(!updationInfo || updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else{
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

    let startYear = new Date(travelDates.start).getFullYear();
    let endYear = new Date(travelDates.end).getFullYear();
    let startMonth = new Date(travelDates.start).getMonth();
    let endMonth = new Date(travelDates.end).getMonth();
    if (isNaN(startYear) || isNaN(endYear) || isNaN(startMonth) || isNaN(endMonth)) { //checks if the date strings provided were valid or not
        throw new Error(errorMessages.InvalidDateFormat);
    }
    let yearDiff = Math.abs(endYear - startYear);
    let monthDiff = Math.abs(endMonth - startMonth);
    let monthsArr = [];
    if (yearDiff > 1) {
        monthsArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    } else if (yearDiff == 1) {
        for (let i = startMonth; i < 12; i++) {
            monthsArr.push(i);
        }
        for (let j = 0; j <= endMonth; j++) {
            monthsArr.push(j);
        }
    } else {
        for (let i = startMonth; i <= endMonth; i++) {
            monthsArr.push(i);
        }
    }
    //what about cross-year time range???

    let minTemp;    //lowest temperature of the destination
    let maxTemp;    //highest temperature of the destination
    let summerTemp = 25;    //temperature for summer packing list
    let winterTemp = 10;    //temperature for winter packing list
    

    for (var i in monthsArr) {
        let currentMonth = allWeather[i];   //gets the current month weather data
        if (currentMonth.rain == "true") {  //the destination has rain
            hasRain = true;
        }
        if (currentMonth.avgHigh > maxTemp) {   //found higher maxTemp
            maxTemp = currentMonth.avgHigh;
        } else if (maxTemp === undefined) { //initial maximum temperature
            maxTemp = currentMonth.avgLow;
        }
        //min temp is incorrect
        if (currentMonth.avgLow < minTemp) { //found lower minTemp
            minTemp = currentMonth.avgLow;
        } else if (minTemp === undefined) { //initial minimum temperature
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

/** */
async function main() {
    try {
        //scenarios:
        //1. 01/05/2019~05/21/2019: Months: 1, 2, 3, 4, 5, yearDiff == 0
        //2. 11/31/2019~02/23/2020: Months: 11, 12, 1, 2, yearDiff == 1
        //3. 12/31/2019~02/23/2021: Mothhs: 1 ~ 12, yearDiff > 1
        let travelDates = {
            start: "01/13/2020",
            end: "02/15/2020"
        };
        let tourType = ["hiking", "business"];
        let destinationObj = await destination.getDestinationById("5dd9862661569c6ee430ff97");
        console.log(`destinationObj name = ${destinationObj.d_name}`);
        // let startMonth = new Date(travelDates.start).getMonth();
        // let endMonth = new Date(travelDates.end).getMonth();
        // console.log(`startMonth = ${startMonth}`);
        // console.log(`endMonth = ${endMonth}`);
        // console.log(`getFullYear = ${new Date(travelDates.start).getFullYear()}`);
        console.log(await generatePackingList(travelDates, destinationObj, tourType));
        
        // let finalPack = await getPackingList("basic");
        // let hikingList = await getPackingList("hiking");
        // console.log(finalPack.concat(hikingList));

        // for (let current in packingList) {
        //     await createPackingList(packingList[current].type, packingList[current].items);
        // }
        
    } catch (error) {
        console.log(error);
    }
}

main();

module.exports = {createPackingList, getPackingList, addItemsToPackingList, deletePackingList, removeItemsFromPackingList, generatePackingList};


