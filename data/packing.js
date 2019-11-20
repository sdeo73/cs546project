const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const packing = mongoCollections.packing;

async function createPackingList(type, items){
    if(!type || !items) throw new Error("Argument Missing!");
    if(typeof type !== 'string' || !Array.isArray(items)) throw new Error("Argument not of correct type!");

    const packingCollection = await packing();

    let newList = {
        type: type,
        items: items
    };

    const listExists = await packingCollection.findOne({"type" : type});

    if(listExists) throw new Error("Packing list already exists!");

    const insertInfo = await packingCollection.insertOne(newList);

    if(insertInfo == null) throw new Error('Insertion failed!');

    if (insertInfo.insertedCount === 0) throw new Error('Could not add packing list!');

    return true;

}

async function getPackingList(type){
    if(!type) throw new Error("Type not entered!");
    if(typeof type !== 'string') throw new Error("Type is not of proper type!");

    const packingCollection = await packing();

    const packingList = await packingCollection.findOne({"type": type});

    if(!packingList) throw new Error("No packing list with that type!");

    return packingList.items;
}

async function addItemsToPackingList(type, items){
    if(!type || !items) throw new Error("Argument Missing!");
    if(typeof type !== 'string') throw new Error("Argument not of correct type!");

    if(typeof items == 'string'){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: items}});

        if(!updationInfo) throw new Error("Update Failed!");
        if(updationInfo.updatedCount == 0) throw new Error("No packing list exists with that type!");

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$addToSet: {items: {$each: items}}});

        if(!updationInfo) throw new Error("Update Failed!");
        if(updationInfo.updatedCount == 0) throw new Error("No packing list exists with that type!");

        return true;
    }else{
        throw new Error("Argument not of correct type!");
    }
}

async function deletePackingList(type){
    if(!type) throw new Error("Type not entered!");
    if(typeof type !== 'string') throw new Error("Type is not of proper type!");

    const packingCollection = await packing();
    const deletionInfo = await packingCollection.removeOne({"type": type});

    if(!deletionInfo) throw new Error("Delete Failed!");
    if(deletionInfo.deletedCount ==0) throw new Error("No packing list exists with that type!");

    return true;
}

async function removeItemsFromPackingList(type, items){
    if(!type || !items) throw new Error("Argument Missing!");
    if(typeof type !== 'string') throw new Error("Argument not of correct type!");

    if(typeof items == 'string'){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: items}});

        if(!updationInfo) throw new Error("Removal Failed!");
        if(updationInfo.updatedCount == 0) throw new Error("No packing list exists with that type!");

        return true;
    }else if(Array.isArray(items)){
        const packingCollection = await packing();
        const updationInfo = await packingCollection.updateOne({"type": type}, {$pull: {items: {$each: items}}});

        if(!updationInfo) throw new Error("Removal Failed!");
        if(updationInfo.updatedCount == 0) throw new Error("No packing list exists with that type!");

        return true;
    }else{
        throw new Error("Argument not of correct type!");
    }
}

module.exports = {createPackingList, getPackingList, addItemsToPackingList, deletePackingList, removeItemsFromPackingList};


