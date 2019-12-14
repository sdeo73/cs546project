const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const error = require('../public/errorMessages');
const userFunctions = require('./users');

/**
 * Function to check if user with userID has already selected userPreferences
 * @param {*} userID 
 * @returns Boolean value stating is user preference object exists in user collection, else returns errors array
 */
async function checkUserPreferenceExists(userID) {
    let errors = [];
    if (!userID) {
        errors.push(error.noUserIDWasProvided);
    } if (!ObjectId.isValid(userID)) {
        errors.push(error.userIDInvalid);
    } if (errors.length > 0) {
        return errors;
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (user == null) {
        throw new Error(error.userDoesNotExist);
    }
    if ('userPreferences' in user) {
        return true;
    } else {
        return false;
    }
}

/**
    * Creates a new user preference object and inserts it into the users collection.
    * @param {*} gender User's gender
    * @param {*} dob User's birthday in yyyy-mm-dd
    * @param {*} mealPreference An array of meal preferences
    * @param {*} tourType String representing tour type
    * @param {*} tourActivity String representing tour activity
    * @param {*} nTravelers Integer representing number of travelers
    * @param {*} specialNeeds An array of special needs
    * @param {*} budget Integer representing budget per person, minimum limit 2000
    * @param {*} destination String representing destination (city)
    * @param {*} travelDateStart User's travel start date in yyyy-mm-dd
    * @param {*} travelDateEnd User's travel end date in yyyy-mm-dd
    * @param {*} userID User's ID retreived from session
    * @returns true if insertion was successful, else returns errors array
    */
async function addUserPreferences(gender, dob, mealPreference, tourType, tourActivity, nTravelers, specialNeeds, budget, destination, travelDateStart, travelDateEnd, userID) {
    let errors = [];
    if (!gender) {
        errors.push(error.genderMissing);
    } if (!dob) {
        errors.push(error.dobMissing);
    } if (!mealPreference) {
        errors.push(error.mealPrefMissing)
    } if (!tourType) {
        errors.push(error.tourTypeMissing);
    } if (!tourActivity) {
        errors.push(error.tourActivityMissing);
    } if (!nTravelers) {
        errors.push(error.nTravelersMissing);
    } if (!budget) {
        errors.push(error.budgetMissing);
    } if (!destination) {
        errors.push(error.destinationMissing);
    } if (!travelDateStart || !travelDateEnd) {
        errors.push(error.travelDatesMissing);
    }

    if (!Array.isArray(mealPreference)) {
        mealPreference = mealPreference.split(",");
    }

    //Check if birthday is valid: 
    const getAge = dob => Math.floor((new Date() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)); //Referenced from https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
    let age = getAge(dob);
    if (age < 16) {
        errors.push(error.minimumAgeError);
    }

    //Check if travel dates are valid:
    let timeDifference = new Date(travelDateEnd).getTime() - new Date(travelDateStart).getTime();
    let numberOfDays = (timeDifference / (1000 * 3600 * 24)) + 1;
    if (travelDateEnd < travelDateStart) {
        errors.push(error.travelDatesInvalid)
    } else if (numberOfDays > 7) {
        errors.push(error.travelDatesMaxLimit);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
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
        tourActivity: tourActivity,
        noOfTravelers: parseInt(nTravelers),
        specialNeeds: specialNeeds,
        budget: parseInt(budget),
        destination: destination,
        travelDates: {
            start: travelDateStart,
            end: travelDateEnd
        }
    };

    const userObject = await usersCollection.updateOne({ _id: new ObjectId(userID) }, { $set: { gender: gender, dob: dob, userPreferences: userPreferences } });
    if (userObject.updatedCount === 0) {
        throw new Error(error.userPrefCreationError);
    } else {
        return true;
    }
}

/**
 * Function to update user's meal preference.
 * @param {*} userID User ID to update
 * @param {*} newMealPreference An array of meal preferences
 * @returns Updated user object if successful, else throws error.
 */
async function updateUserMealPref(userID, newMealPreference) {
    let errors = [];
    if (!newMealPreference) {
        errors.push(error.mealPrefMissing);
    }

    if (!Array.isArray(newMealPreference)) {
        newMealPreference = newMealPreference.split(',');
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }

    const mealPreferenceObject = {
        vegan: newMealPreference.includes("vegan"),
        vegetarian: newMealPreference.includes("vegetarian"),
        whiteMeat: newMealPreference.includes("whiteMeat"),
        redMeat: newMealPreference.includes("redMeat"),
        seafood: newMealPreference.includes("seafood"),
        eggs: newMealPreference.includes("eggs")
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.mealPreference': mealPreferenceObject } });
    if (!updatedObject) {
        throw new Error(error.mealPrefUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's tour activity.
 * @param {*} userID User ID to update
 * @param {*} newTourActivity  String representing tour activity
 * @returns Updated user object if successful, else throws error.
 */
async function updateUserTourActivity(userID, newTourActivity) {
    let errors = [];
    if (!newTourActivity) {
        errors.push(error.tourActivityMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.tourActivity': newTourActivity } });
    if (!updatedObject) {
        throw new Error(error.tourActivityUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's tour type.
 * @param {*} userID User ID to update
 * @param {*} newTourType  String representing tour type
 * @returns Updated user object if successful, else throws error.
 */
async function updateUserTourType(userID, newTourType) {
    let errors = [];
    if (!newTourType) {
        errors.push(error.tourTypeMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.tourType': newTourType } });
    if (!updatedObject) {
        throw new Error(error.tourTypeUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update number of travelers.
 * @param {*} userID User ID to update
 * @param {*} newNTravelers  Integer representing number of travelers
 * @returns Updated user object if successful, else throws error.
 */
async function updateNumOfTravelers(userID, newNTravelers) {
    let errors = [];
    if (!newNTravelers) {
        errors.push(error.nTravelersMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.noOfTravelers': parseInt(newNTravelers) } });
    if (!updatedObject) {
        throw new Error(error.nTravelersUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's special needs
 * @param {*} userID User ID to update
 * @param {*} newSpecialNeeds  An array of special needs
 * @returns Updated user object if successful, else throws error.
 */
async function updateSpecialNeeds(userID, newSpecialNeeds) {
    let errors = [];
    if (!newSpecialNeeds) {
        errors.push(error.specialNeedsMissing);
    } else if (typeof newSpecialNeeds != "boolean") {
        throw new Error(error.specialNeedsInvalidType);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    if (newSpecialNeeds == 'yes') {
        newSpecialNeeds = true;
    } else {
        newSpecialNeeds = false;
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.specialNeeds': newSpecialNeeds } });
    if (!updatedObject) {
        throw new Error(error.specialNeedsUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's budget
 * @param {*} userID User ID to update
 * @param {*} newBudget Integer representing budget per person, minimum limit 2000
 * @returns Updated user object if successful, else throws error.
 */
async function updateBudget(userID, newBudget) {
    let errors = [];
    if (!newBudget) {
        errors.push(error.budgetMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.budget': parseInt(newBudget) } });
    if (!updatedObject) {
        throw new Error(error.budgetUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's destination
 * @param {*} userID User ID to update
 * @param {*} newDestination String representing destination (city)
 * @returns Updated user object if successful, else throws error.
 */
async function updateUserDestination(userID, newDestination) {
    let errors = [];
    if (!newDestination) {
        errors.push(error.destinationMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    const updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.destination': newDestination } });
    if (!updatedObject) {
        throw new Error(error.destinationUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Function to update user's travel dates, user can update either one date, or both
 * @param {*} userID User ID to update
 * @param {*} newTravelStartDate User's travel start date in yyyy-mm-dd
 * @param {*} newTravelEndDate User's end start date in yyyy-mm-dd
 * @returns Updated user object if successful, else throws error.
 */
async function updateTravelDates(userID, newTravelStartDate, newTravelEndDate) {
    let errors = [];
    if (!newTravelStartDate && !newTravelEndDate) {
        errors.push(error.travelDatesMissing);
    }

    if (errors.length > 0) {
        return errors;
    }

    if (!userID) {
        throw new Error(error.userIDMissing);
    }
    const usersCollection = await users();
    const userToUpdate = await usersCollection.findOne({ _id: new ObjectId(userID) });
    if (!userToUpdate) {
        throw new Error(error.userDoesNotExist);
    }
    let updatedObject;
    if (!newTravelStartDate) {
        updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.travelDates.end': newTravelEndDate } });
    } else if (!newTravelEndDate) {
        updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.travelDates.start': newTravelStartDate } });
    } else {
        updatedObject = await usersCollection.updateOne(userToUpdate, { $set: { 'userPreferences.travelDates.start': newTravelStartDate, 'userPreferences.travelDates.end': newTravelEndDate } });
    }
    if (!updatedObject || updatedObject.modifiedCount == 0) {
        throw new Error(error.travelDateUpdationFailed);
    } else {
        return userFunctions.getUserById(userID);
    }
}

/**
 * Fetch preferences of a specific user
 * 
 * @param {*} userID ID of user to fetch preferences of
 * @returns Preferences of user
 */
async function getUserPreferences(userID) {
    const user = await userFunctions.getUserById(userID);
    let userPreferences = await user.userPreferences;
    return userPreferences;
}

module.exports = {
    addUserPreferences, checkUserPreferenceExists, updateUserMealPref, updateUserTourActivity, updateUserTourType, updateNumOfTravelers, updateSpecialNeeds, updateBudget, updateUserDestination, updateTravelDates, getUserPreferences
}
