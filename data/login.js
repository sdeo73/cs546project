const errorMessages = require('../public/errorMessages');
const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const passwordHash = require('password-hash');
const bcrypt = require("bcrypt");

let exportedMethods = {
    /** 
     * Retrieves and returns the current user's data from user collection.
     * Returns error if user email was missing.
     * 
     * @param user_email the current login user's email
     * @returns userData an object with all the current user's data
    */
    async getHashPassword(user_email) {
        let errors = [];
        if (!user_email) {
            errors.push(errorMessages.emailMissing);
        }

        if(errors.length > 0) return errors;

        const userCollection = await users();
        const current_user = await userCollection.findOne({email: user_email});

        return current_user;
    },

    /**
     * Updates and inserts the session id into user collection. Returns errors if userID or sessionID was missing or
     * if insertion failed.
     * 
     * @param userID    current login user id.
     * @param sessionID current session id.
     */
    async insertSessionID(userID, sessionID) {
        let errors = [];
        if (!userID) {
            errors.push(errorMessages.noUserIDWasProvided);
        }
        if (!sessionID) {
            errors.push(errorMessages.noSessionID);
        }

        if(errors.length > 0) return errors;
        const userCollection = await users();
        const insertSession = await userCollection.updateOne({_id: object_id}, {$set: updateAnimal});
        if (insertSession.modifiedCount === 0) {
            errors.push(errorMessages.sessionInsertionErr);
        }
        if(errors.length > 0) return errors;

    },

    /** 
     * Testing function
     * Insert temporary data into user collection (just email and password)
     * 
    */
    async insertUserData(user_email, user_pass) {
        const userCollection = await users();

        let newUser = {
            // firstName: firstName,
            // lastName: lastName,
            email: user_email,
            password: await passwordHash.generate(user_pass)
            // nationality: nationality
        }

        const insertInfo = await userCollection.insertOne(newUser);
        if(insertInfo == null) throw new Error(errorMessages.userCreationError);
        
        if(insertInfo.insertedCount == 0) throw new Error(errorMessages.userCreationError);
    }
};

module.exports = exportedMethods;