const errorMessages = require('../public/errorMessages');
const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const passwordHash = require('password-hash');

/**
 * Validates the passed in user credential by comparing the email and password against
 * the ones in the user collection.
 * 
 * @param user_email the email that user provides during login
 * @param user_pass the email that user provides during login
 * @returns boolean indicates whether the user's email and password exists and are matching
*/
async function loginValidation(user_email, user_pass) {
    //validates that the user email and password are string and valide
    let errors = [];
    if (!user_email) {
        errors.push(errorMessages.emailMissing);
    }

    if (!user_pass) {
        errors.push(errorMessages.passwordMissing);
    }
    if(errors.length > 0) return errors;
    
    console.log("loginValidation user_email = " + user_email);
    console.log("loginValidation user_pass = " + user_pass);


    const userCollection = await users();
    //checks if the database contains the user email and password
    // const hashPass = await passwordHash.generate(user_pass);
    // console.log(`hashPass = ${hashPass}`);
    const current_user = await userCollection.findOne({email: user_email});
    // console.log(`current_user = ${current_user}`);
    // console.log(`current user password = ${current_user.password}`);
    if (current_user === null) {
        errors.push(errorMessages.incorrectUserEmail);
    }
    if (current_user !== null && user_pass !== current_user.password) {
        errors.push(errorMessage.incorrectUserPassword);
    }
    if(errors.length > 0) return errors;
    //returns a boolean
    return true;
}

/** 
 * Testing function
 * Insert temporary data into user collection (just email and password)
 * 
*/
async function insertUserData(user_email, user_pass) {
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

module.exports = {
    loginValidation,
    insertUserData
};