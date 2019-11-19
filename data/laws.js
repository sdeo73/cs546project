const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require("./../config/mongoCollections");
const laws = mongoCollections.laws;
const errorMessages = require('../public/errorMessages');

async function getAllLaws() {
    let errors = [];
    if (arguments.length > 0) {
        error.push(errorMessages.noArguments);
    } if (errors.length > 0) {
        return errors;
    }

    const lawsCollection = await laws();
    var allLaws = await lawsCollection.find({}).toArray();
    if (allLaws.length < 1) {
        throw new Error(errorMessages.lawsCollectionEmpty);
    } else {
        return allLaws;
    }
}

async function getLawById(lawId) {
    let errors = [];
    if (lawId === undefined) {
        errors.push(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        errors.push(errorMessages.lawIDInvalid);
    }
    if (errors.length > 0) {
        return errors;
    }

    const lawsCollection = await laws();
    var law = await lawsCollection.findOne({ '_id': new ObjectId(lawId) });
    if (law === null || law === undefined) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        return law;
    }

}

async function createLaw(description) {
    let errors = [];
    if (description === undefined) {
        errors.push(errorMessages.lawDescriptionMissing)
    } else if (typeof description !== 'string') {
        errors.push(errorMessages.lawDescriptionInvalid)
    }

    if (errors.length > 0) {
        return errors;
    }
    const lawsCollection = await laws();
    let newLaw = {
        description: description
    };
    const lawObject = await lawsCollection.insertOne(newLaw);
    if (lawObject.insertedCount === 0) {
        throw new Error(errorMessages.lawCreationError);
    } else {
        const lawId = lawObject.insertedId;
        const law = await this.getLawById(lawId);
        return law;
    }
}

async function updateLaw(lawId, newDescription) {
    let errors = [];
    if (lawId === undefined) {
        errors.push(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        errors.push(errorMessages.lawIDInvalid);
    }

    if (newDescription === undefined) {
        errors.push(errorMessages.lawDescriptionMissing)
    } else if (typeof newDescription !== 'string') {
        errors.push(errorMessages.lawDescriptionInvalid)
    }

    if (errors.length > 0) {
        return errors;
    }

    const lawsCollection = await laws();
    const lawToUpdate =  await lawsCollection.findOne({'_id':new ObjectId(lawId)});
    if(lawToUpdate===null) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        const updatedLaw = await lawsCollection.updateOne(lawToUpdate,{$set:{description: newDescription}});
        if(updatedLaw.modifiedCount===0) {
            throw new Error(errorMessages.lawUpdationError);
        }
        return this.getLawById(lawId);
    }
}

async function deleteLawById(lawId) {
    let errors = [];
    if (lawId === undefined) {
        errors.push(errorMessages.lawIDMissing);
    } else if (!ObjectId.isValid(lawId)) {
        errors.push(errorMessages.lawIDInvalid);
    }

    if (errors.length > 0) {
        return errors;
    }

    const lawsCollection = await laws();
    const lawToDelete =  await lawsCollection.findOne({'_id':new ObjectId(lawId)});
    if(lawToDelete===null) {
        throw new Error(errorMessages.lawNotFound);
    } else {
        const lawDeleted = lawsCollection.deleteOne({'_id':new ObjectId(lawId)});
        if(lawDeleted.deletedCount===0) {
            throw new Error(errorMessages.lawNotDeleted);
        } else {
            return lawToDelete;
        }
    }
}

module.exports = {
    getAllLaws, getLawById, createLaw, updateLaw, deleteLawById
}
