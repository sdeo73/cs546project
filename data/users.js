const errorMessages = require('../public/errorMessages');
const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const ObjectId = require("mongodb").ObjectID;

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
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            throw new Error(errorMessages.userIDInvalid);
        }
        //gets the specific destination
        const usersCollection = await users();
        const singleUser = await usersCollection.findOne({_id: ObjectId(userId)});
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
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            throw new Error(errorMessages.userIDInvalid);
        }

        //removes the user from the database
        const usersCollection = await users();
        const removedUser = await usersCollection.removeOne({_id: ObjectId(userId)});
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
    */
    async updateUserGender(userId, gender) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!gender || typeof(gender) != "string" || gender.length == 0) {
            errors.push(errorMessages.InvalidGender);
        }
        if(errors.length > 0) return errors;

        //updates the user's gender
        const newUser = {
            gender: gender
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId); 
    },
    /** 
     * Updates the date of birth of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param birthdate user birthdate in string format
    */
    async updateDOB(userId, birthdate) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!birthdate || typeof(birthdate) != "string" || birthdate.length == 0) {
            errors.push(errorMessages.InvalidDateOfBirth);
        }
        if(errors.length > 0) return errors;

        //updates the user's gender
        const newUser = {
            dob: birthdate
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId); 
    },
    /** 
     * Updates the first name of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newfirstName first name of a user in string format
    */
    async updateFirstName(userId, newfirstName) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!newfirstName || typeof(newfirstName) != "string" || newfirstName.length == 0) {
            errors.push(errorMessages.InvalidFirstName);
        }
        if(errors.length > 0) return errors;

        //updates the user's first name
        const newUser = {
            firstName: newfirstName
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId);
    },
    /** 
     * Updates the last name of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newlastName last name of a user in string format
    */
    async updateLastName(userId, newlastName) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!newlastName || typeof(newlastName) != "string" || newlastName.length == 0) {
            errors.push(errorMessages.InvalidLastName);
        }
        if(errors.length > 0) return errors;

        //updates the user's last name
        const newUser = {
            firstName: newlastName
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId);
    },
    /** 
     * Updates the email of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param newEmail email of a user in string format
    */
    async updateEmail(userId, newEmail) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!newEmail || typeof(newEmail) != "string" || newEmail.length == 0) {
            errors.push(errorMessages.invalidEmail);
        }
        if(errors.length > 0) return errors;

        //updates the user's email
        const newUser = {
            email: newEmail
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId);
    },
    /** 
     * Updates the nationality of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param nation nationality of a user in string format
    */
    async updateNationality(userId, nation) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!nation || typeof(nation) != "string" || nation.length == 0) {
            errors.push(errorMessages.InvalidCountryName);
        }
        if(errors.length > 0) return errors;

        //updates the user's nationality
        const newUser = {
            nationality: nation
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId);
    },
    /** 
     * Updates the itinerary of a specific user. Throws error if invalid 
     * argument(s) was provided or encountered query error.
     * 
     * @param userId user id in string format
     * @param itinerary itinerary of a user in object format
    */
    async updateUserItinerary(userId, itinerary) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!userId || typeof(userId) != "string" || userId.length == 0) {
            errors.push(errorMessages.userIDInvalid);
        }
        if (!itinerary || typeof(itinerary) != "object" || itinerary.length == 0) {
            errors.push(errorMessages.InvalidItineraryObject);
        }
        if(errors.length > 0) return errors;

        //updates the user's first name
        const newUser = {
            itinerary: itinerary
        };
        const usersCollection = await users();
        const updatedUser = await usersCollection.updateOne({_id: ObjectId(userId)}, {$set: newUser});
        if (!updatedUser || updatedUser.modifiedCount === 0) {
            errors.push(errorMessages.UpdateUserError);
        }
        if(errors.length > 0) return errors;

        return this.getUserById(userId);
    }
};

module.exports = exportedMethods;