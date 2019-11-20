const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require("./../config/mongoCollections");
const laws = mongoCollections.laws;
const errorMessages = require('../public/errorMessages');

async function getAllLaws() {
    if (arguments.length > 0) {
        throw new Error(errorMessages.noArguments);
    } 

    const lawsCollection = await laws();
    const allLaws = await lawsCollection.find({}).toArray();
    if (allLaws.length < 1) {
        throw new Error(errorMessages.lawsCollectionEmpty);
    } else {
        return allLaws;
    }
}

async function getLawById(lawId) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!lawId) {
        throw new Error(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        throw new Error(errorMessages.lawIDInvalid);
    }
    const lawsCollection = await laws();
    const law = await lawsCollection.findOne({ '_id': new ObjectId(lawId) });
    if (!law) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        return law;
    }

}

async function createLaw(description) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!description) {
        throw new Error(errorMessages.lawDescriptionMissing)
    } else if (typeof description !== 'string') {
        throw new Error(errorMessages.lawDescriptionInvalid)
    }
    const lawsCollection = await laws();
    lawsCollection.createIndex({"description":1},{unique: true});
    let newLaw = {
        description: description
    };
    const lawObject = await lawsCollection.insertOne(newLaw);
    if (!lawObject || lawObject.insertedCount === 0) {
        throw new Error(errorMessages.lawCreationError);
    } else {
        const lawId = lawObject.insertedId;
        const law = await this.getLawById(lawId);
        return law;
    }
}

async function updateLaw(lawId, newDescription) {
    if(arguments.length!==2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!lawId) {
        throw new Error(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        throw new Error(errorMessages.lawIDInvalid);
    } else if (!newDescription) {
        throw new Error(errorMessages.lawDescriptionMissing)
    } else if (typeof newDescription !== 'string') {
        throw new Error(errorMessages.lawDescriptionInvalid)
    }
    const lawsCollection = await laws();
    const lawToUpdate =  await lawsCollection.findOne({'_id':new ObjectId(lawId)});
    if(!lawToUpdate) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        const updatedLaw = await lawsCollection.updateOne(lawToUpdate,{$set:{description: newDescription}});
        if(!updatedLaw || updatedLaw.modifiedCount===0) {
            throw new Error(errorMessages.lawUpdationError);
        }
        return this.getLawById(lawId);
    }
}

async function deleteLawById(lawId) {
    if(arguments.length!==1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!lawId) {
        throw new Error(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        throw new Error(errorMessages.lawIDInvalid);
    }
    const lawsCollection = await laws();
    const lawToDelete =  await lawsCollection.findOne({'_id':new ObjectId(lawId)});
    if(!lawToDelete) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        const lawDeleted = lawsCollection.deleteOne({'_id':new ObjectId(lawId)});
        if(!lawDeleted || lawDeleted.deletedCount===0) {
            throw new Error(errorMessages.lawNotDeleted);
        } else {
            return lawToDelete;
        }
    }
}

module.exports = {
    getAllLaws, getLawById, createLaw, updateLaw, deleteLawById
}
