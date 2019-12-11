const errorMessages = require('../public/errorMessages');
const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const ObjectId = require("mongodb").ObjectID;

// Removed modified count check in update functions so as to not throw an error in case user's new entered data in edit profile is same as existing data

let exportedMethods = {
    /** 
     * Finds a specific user with the matching user id.
     * Throws error if invalid argument(s) was provided or encountered query error. 
     * 
     * @param userId the user id in string format
     * @returns user object the user with matching id
    */
    async getUserById(userId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new Error(errorMessages.userIDInvalid);
        }
        //gets the specific destination
        const usersCollection = await users();
        const singleUser = await usersCollection.findOne({ _id: ObjectId(userId) });
        if (!singleUser) {
            throw new Error(errorMessages.userDoesNotExist);
        }
        return singleUser;
    },
    /** 
     * Removes a user with matching id from the users collection.
     * Throws error if invalid argument(s) was provided or encountered query error.
     * @param userId user id in string format
     * @returns user object that was removed
    */
    async removeUserById(userId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);

        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new Error(errorMessages.userIDInvalid);
        }

        //removes the user from the database
        const usersCollection = await users();
        const removedUser = await usersCollection.removeOne({ _id: ObjectId(userId) });
        if (!removedUser || removedUser.deletedCount == 0) {
            throw new Error(errorMessages.UserRemovalError);
        }

        return removedUser;
    },
    /** 
     * Updates the gender of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param gender user gender in string format
     * @returns user the updated user object
    */
    async updateUserGender(userId, gender) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!gender || typeof (gender) != "string" || gender.length == 0) {
            throw new errorMessages.InvalidGender;
        }

        //updates the user's gender
        const newUser = {
            gender: gender
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the date of birth of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param birthdate user birthdate in string format
     * @returns user the updated user object
    */
    async updateDOB(userId, birthdate) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!birthdate || typeof (birthdate) != "string" || birthdate.length == 0) {
            throw new errorMessages.InvalidDateOfBirth;
        }

        //updates the user's gender
        const newUser = {
            dob: birthdate
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the first name of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newfirstName first name of a user in string format
     * @returns user the updated user object 
    */
    async updateFirstName(userId, newfirstName) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!newfirstName || typeof (newfirstName) != "string" || newfirstName.length == 0) {
            throw new errorMessages.InvalidFirstName;
        }

        //updates the user's first name
        const newUser = {
            firstName: newfirstName
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the last name of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newlastName last name of a user in string format
     * @returns user the updated user object
    */
    async updateLastName(userId, newlastName) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!newlastName || typeof (newlastName) != "string" || newlastName.length == 0) {
            throw new errorMessages.InvalidLastName;
        }

        //updates the user's last name
        const newUser = {
            firstName: newlastName
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the email of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newEmail email of a user in string format
     * @returns user the updated user object
    */
    async updateEmail(userId, newEmail) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!newEmail || typeof (newEmail) != "string" || newEmail.length == 0) {
            throw new errorMessages.invalidEmail;
        }

        //updates the user's email
        const newUser = {
            email: newEmail
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the nationality of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param nation nationality of a user in string format
     * @returns user the updated user object
    */
    async updateNationality(userId, nation) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!nation || typeof (nation) != "string" || nation.length == 0) {
            throw new errorMessages.InvalidCountryName;
        }

        //updates the user's nationality
        const newUser = {
            nationality: nation
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },
    /** 
     * Updates the itinerary of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param itinerary itinerary of a user in object format
     * @returns user the updated user object
    */
    async updateUserItinerary(userId, itinerary) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new errorMessages.wrongNumberOfArguments;
        }
        //validates arguments type
        if (!userId || typeof (userId) != "string" || userId.length == 0) {
            throw new errorMessages.userIDInvalid;
        }
        if (!itinerary || typeof (itinerary) != "object" || itinerary.length == 0) {
            throw new errorMessages.InvalidItineraryObject;
        }

        //updates the user's first name
        const newUser = {
            itinerary: itinerary
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userId) }, { $set: newUser });
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            throw new errorMessages.UpdateUserError;
        }

        return this.getUserById(userId);
    },

    /**
     * Function to retrieve number of failed login attempts 
     * @param {*} email - Email of a user in string format
     * @returns -1 if user was not found, else returns the number of failed attempts
     */
    async getFailedAttempts(email) {
        if (arguments.length !== 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        if (!email) {
            throw new Error(errorMessages.noEmailWasProvided);
        } else if (typeof (email) !== 'string') {
            throw new Error(errorMessages.invalidEmail);
        }

        const usersCollection = await users();
        const user = await usersCollection.findOne({ 'email': email });
        if (user == null) {
            return -1;
        } else {
            return user.failedAttempts;
        }
    },

    /**
     *  Function to retrieve time stamp from the user
     * @param {*} email - Email of a user in string format
     * @returns -1 if user was not found, else returns the timestamp
     */
    async getTimeStamp(email) {
        if (arguments.length !== 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        if (!email) {
            throw new Error(errorMessages.noEmailWasProvided);
        } else if (typeof (email) !== 'string') {
            throw new Error(errorMessages.invalidEmail);
        }

        const usersCollection = await users();
        const user = await usersCollection.findOne({ 'email': email });
        if (user == null) {
            return -1;
        } else {
            return user.latestTimeStamp;
        }
    },

    /**
     * Function to increment number of failed attempts by 1
     * @param {*} email - Email of a user in string format
     * @returns False if not updated, else returns number of failed attempts
     */
    async updateFailedAttempts(email) {
        if (arguments.length !== 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        if (!email) {
            throw new Error(errorMessages.noEmailWasProvided);
        } else if (typeof (email) !== 'string') {
            throw new Error(errorMessages.invalidEmail);
        }

        const usersCollection = await users();
        const user = await usersCollection.updateOne({ 'email': email }, { $inc: { 'failedAttempts': 1 } });
        if (user == null || user.modifiedCount == 0) {
            return false;
        } else {
            return (await usersCollection.findOne({ 'email': email })).failedAttempts;
        }
    },

    /**
     * Function to reset number of failed attempts to 0
     * @param {*} email - Email of a user in string format
     * @returns False if not reset, else true
     */
    async resetFailedAttempts(email) {
        if (arguments.length !== 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        if (!email) {
            throw new Error(errorMessages.noEmailWasProvided);
        } else if (typeof (email) !== 'string') {
            throw new Error(errorMessages.invalidEmail);
        }

        const usersCollection = await users();
        const user = await usersCollection.updateOne({ 'email': email }, { $set: { 'failedAttempts': 0 } });
        if (user == null || user.modifiedCount == 0) {
            return false;
        } else {
            return true;
        }
    },

    /**
   * Function to update time stamp to current time
   * @param {*} email - Email of a user in string format
   * @returns False if not updated, else true
   */
    async updateTimeStamp(email) {
        if (arguments.length !== 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        if (!email) {
            throw new Error(errorMessages.noEmailWasProvided);
        } else if (typeof (email) !== 'string') {
            throw new Error(errorMessages.invalidEmail);
        }

        const usersCollection = await users();
        const user = await usersCollection.updateOne({ 'email': email }, { $set: { 'latestTimeStamp': Date.now() } });
        if (user.modifiedCount == 0) {
            return false;
        } else {
            return true;
        }
    }
};

module.exports = exportedMethods;