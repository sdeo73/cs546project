const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const error = require('../public/errorMessages');

async function addUserPreferences(gender, dob, mealPreference, tourType, nTravelers, specialNeeds, budget, destination, travelDateStart, travelDateEnd, userID) {
    let errors = [];
    if (!gender) {
        errors.push(error.genderMissing);
    } if (!dob) {
        errors.push(error.dobMissing);
    } if (!mealPreference) {
        errors.push(error.mealPrefMissing)
    } if (!tourType) {
        errors.push(error.tourTypeMissing);
    } if (!nTravelers) {
        errors.push(error.nTravelersMissing);
    } if (!budget) {
        errors.push(error.budgetMissing);
    } if (!destination) {
        errors.push(error.destinationMissing);
    } if (!travelDates) {
        errors.push(error.travelDatesMissing);
    } if (errors.length > 0) {
        return errors;
    }
    const usersCollection = await users();

    let userPreferences = {
        mealPreference: {
        vegan: mealPreference.includes("vegan"),
		vegetarian: mealPreference.includes("vegetarian"),
		whiteMeat: mealPreference.includes("whiteMeat"),
		redMeat: mealPreference.includes("redMeat"),
		seafood: mealPreference.includes("seafood"),
		eggs: mealPreference.includes("eggs")
        },
        tourType: tourType,
        noOfTravelers: nTravelers,
        specialNeeds: specialNeeds,
        budget: budget,
        destination: destination,
        travelDates: {
            start: travelDateStart,
            end: travelDateEnd
        }
    };

    const userObject = await usersCollection.updateOne({_id: userID}, {$set: {gender: gender, dob: dob, userPreferences: userPreferences}});
    if (userObject.insertedCount === 0) {
        throw new Error(error.userPrefCreationError);
    } else {
        return true;
    }
}


module.exports = {
    addUserPreferences
}
