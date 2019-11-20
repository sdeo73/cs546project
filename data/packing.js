const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const packing = mongoCollections.packing;
const errorMessages = require('./public/errorMessages');

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

    if(insertInfo == null) throw new Error(errorMessages.packingListAddError);

    if (insertInfo.insertedCount === 0) throw new Error(errorMessages.packingListAddError);

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

        if(!updationInfo) throw new Error(errorMessages.packingListItemUpdateError);
        if(updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: {$each: items}}});

        if(!updationInfo) throw new Error(errorMessages.packingListItemUpdateError);
        if(updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemUpdateError);

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

    if(!deletionInfo) throw new Error(errorMessages.packingListDeleteFailed);
    if(deletionInfo.deletedCount ==0) throw new Error(errorMessages.packingListDeleteFailed);

    return true;
}

async function removeItemsFromPackingList(type, items){
    if(!type || !items) throw new Error(errorMessages.packingListArgumentMissing);
    if(typeof type !== 'string') throw new Error(errorMessages.packingListArgumentTypeError);

    if(typeof items == 'string'){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: items}});

        if(!updationInfo) throw new Error(errorMessages.packingListItemRemovalFailed);
        if(updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: {$in: items}}});

        if(!updationInfo) throw new Error(errorMessages.packingListItemRemovalFailed);
        if(updationInfo.updatedCount == 0) throw new Error(errorMessages.packingListItemRemovalFailed);

        return true;
    }else{
        throw new Error(errorMessages.packingListArgumentTypeError);
    }
}

module.exports = {createPackingList, getPackingList, addItemsToPackingList, deletePackingList, removeItemsFromPackingList};


