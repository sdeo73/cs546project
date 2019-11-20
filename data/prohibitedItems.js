const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require("./../config/mongoCollections");
const prohibitedItems = mongoCollections.prohibitedItems;
const errorMessages = require('../public/errorMessages');

async function getAllProhibitedItems() {
    if (arguments.length > 0) {
        throw new Error(errorMessages.noArguments);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    var allItems = await prohibitedItemsCollection.find({}).toArray();
    if (allItems.length < 1) {
        throw new Error(errorMessages.itemsCollectionEmpty);
    } else {
        return allItems;
    }
}

async function getProhibitedItemById(itemId) {
    if (itemId === undefined) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    var pItem = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (pItem === null || pItem === undefined) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        return pItem;
    }

}

async function createProhibitedItem(itemName) {
    if (itemName === undefined) {
        throw new Error(errorMessages.itemNameMissing)
    } else if (typeof itemName !== 'string') {
        throw new Error(errorMessages.itemNameInvalid)
    } 
    const prohibitedItemsCollection = await prohibitedItems();
    prohibitedItemsCollection.createIndex({ "item_name": 1 }, { unique: true });
    let newItem = {
        item_name: itemName
    };
    const pItemObject = await prohibitedItemsCollection.insertOne(newItem);
    if (pItemObject.insertedCount === 0) {
        throw new Error(errorMessages.itemCreationError);
    } else {
        const pItemId = pItemObject.insertedId;
        const item = await this.getProhibitedItemById(pItemId);
        return item;
    }
}

async function updateProhibitedItem(itemId, newItemName) {
    if (itemId === undefined) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    } else if (newItemName === undefined) {
        throw new Error(errorMessages.itemNameMissing)
    } else if (typeof newItemName !== 'string') {
        throw new Error(errorMessages.itemNameInvalid)
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const itemToUpdate = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (itemToUpdate === null) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        const updatedItem = await prohibitedItemsCollection.updateOne(itemToUpdate, { $set: { item_name: newItemName } });
        if (updatedItem.modifiedCount === 0) {
            throw new Error(errorMessages.itemUpdationError);
        }
        return this.getProhibitedItemById(itemId);
    }
}

async function deleteProhibitedItem(itemId) {
    if (itemId === undefined) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const itemToDelete = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (itemToDelete === null) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        const itemDeleted = prohibitedItemsCollection.deleteOne({ '_id': new ObjectId(itemId) });
        if (itemDeleted.deletedCount === 0) {
            throw new Error(errorMessages.itemsNotDeleted);
        } else {
            return itemToDelete;
        }
    }
}

module.exports = {
    getAllProhibitedItems, getProhibitedItemById, createProhibitedItem, updateProhibitedItem, deleteProhibitedItem
}
