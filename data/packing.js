const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const packing = mongoCollections.packing;
const errorMessages = require('../public/errorMessages');

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

module.exports = {createPackingList, getPackingList, addItemsToPackingList, deletePackingList, removeItemsFromPackingList};


