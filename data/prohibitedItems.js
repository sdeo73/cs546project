const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require("./../config/mongoCollections");
const prohibitedItems = mongoCollections.prohibitedItems;
const errorMessages = require('../public/errorMessages');

async function getAllProhibitedItems() {
    if (arguments.length > 0) {
        throw new Error(errorMessages.noArguments);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const allItems = await prohibitedItemsCollection.find({}).toArray();
    if (allItems.length < 1) {
        throw new Error(errorMessages.itemsCollectionEmpty);
    } else {
        return allItems;
    }
}

async function getProhibitedItemById(itemId) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!itemId) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const pItem = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (!pItem) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        return pItem;
    }

}

async function createProhibitedItem(itemName) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!itemName) {
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
    if (!pItemObject || pItemObject.insertedCount === 0) {
        throw new Error(errorMessages.itemCreationError);
    } else {
        const pItemId = pItemObject.insertedId;
        const item = await this.getProhibitedItemById(pItemId);
        return item;
    }
}

async function updateProhibitedItem(itemId, newItemName) {
    if(arguments.length!==2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!itemId) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    } else if (!newItemName) {
        throw new Error(errorMessages.itemNameMissing)
    } else if (typeof newItemName !== 'string') {
        throw new Error(errorMessages.itemNameInvalid)
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const itemToUpdate = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (!itemToUpdate) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        const updatedItem = await prohibitedItemsCollection.updateOne(itemToUpdate, { $set: { item_name: newItemName } });
        if (!updatedItem || updatedItem.modifiedCount === 0) {
            throw new Error(errorMessages.itemUpdationError);
        }
        return this.getProhibitedItemById(itemId);
    }
}

async function deleteProhibitedItem(itemId) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!itemId) {
        throw new Error(errorMessages.itemIDMissing);
    } else if (!ObjectId.isValid(itemId)) {
        throw new Error(errorMessages.itemIDInvalid);
    }

    const prohibitedItemsCollection = await prohibitedItems();
    const itemToDelete = await prohibitedItemsCollection.findOne({ '_id': new ObjectId(itemId) });
    if (!itemToDelete) {
        throw new Error(errorMessages.itemNotFound);
    } else {
        const itemDeleted = prohibitedItemsCollection.deleteOne({ '_id': new ObjectId(itemId) });
        if (!itemDeleted || itemDeleted.deletedCount === 0) {
            throw new Error(errorMessages.itemsNotDeleted);
        } else {
            return itemToDelete;
        }
    }
}

module.exports = {
    getAllProhibitedItems, getProhibitedItemById, createProhibitedItem, updateProhibitedItem, deleteProhibitedItem
}
