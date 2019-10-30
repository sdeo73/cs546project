const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const userPref = mongoCollections.userPreferences;
const error = require('../public/errorMessages');

async function addUserPreferences(gender, dob, userID, mealPreference, tourType, nTravelers, specialNeeds, budget, destination, travelDates) {
    let errors = [];
    if (!gender) {
        errors.push(error.genderMissing);
    } if (!dob) {
        errors.push(error.dobMissing);
    } if (!userID) {
        errors.push(error.userIDMissing);
    } if (!mealPreference) {
        errors.push(error.mealPrefMissing)
    } if (!tourType) {
        errors.push(error.tourTypeMissing);
    } if (!nTravelers) {
        errors.push(error.nTravelersMissing);
    } if (!specialNeeds) {
        errors.push(error.specialNeedsMissing);
    } if (!budget) {
        errors.push(error.budgetMissing);
    } if (!destination) {
        errors.push(error.destinationMissing);
    } if (!travelDates) {
        errors.push(error.travelDatesMissing);
    } if (errors.length > 0) {
        return errors;
    }
    const userPrefCollection = await userPref();

    let newUserPref = {
        gender: gender,
        dob: new Date(dob),
        userID: userID,
        mealPreference: mealPreference,
        tourType: tourType.split(','),
        noOfTravelers: nTravelers,
        specialNeeds: specialNeeds.split(','),
        budget: budget,
        destination: destination,
        travelDates: travelDates
    };

    const userPrefObject = await userPrefCollection.insertOne(newUserPref);
    if (userPrefObject.insertedCount === 0) {
        throw new Error(error.userPrefCreationError);
    } else {
        return true;
    }
}


module.exports = {
    addUserPreferences
}
