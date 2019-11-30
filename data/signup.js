const errorMessages = require('../public/errorMessages');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const passwordHash = require('password-hash');

/**
 * Creates a new user and adds it to the users collection.
 * Throws errors if invalid argument(s) was provided or query failed.
 * 
 * @param firstName user's first name in string format
 * @param lastName user's last name in string format
 * @param email user's email in string format
 * @param password user's password in string format
 * @param nationality user's nationality in string format
 * @returns boolean indicates whether the new user has been added successfully into the database
 */
async function addUser(firstName, lastName, email, password, nationality){
    let errors = [];
    //validates number of arguments
    if (arguments.length != 5) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }
    //validates argument type
    if(!firstName || typeof(firstName) != "string" || firstName.length == 0)
        errors.push(errorMessages.firstNameMissing);
    if(!lastName || typeof(lastName) != "string" || lastName.length == 0)
        errors.push(errorMessages.lastNameMissing);
    if(!email || typeof(email) != "string" || email.length == 0)
        errors.push(errorMessages.emailMissing);
    if(!password || typeof(password) != "string" || password.length == 0)
        errors.push(errorMessages.passwordMissing);
    if(!nationality || !Array.isArray(nationality) || nationality.length == 0)
        errors.push(errorMessages.nationalityMissing);
        
    if(errors.length > 0) return errors;

    //inserts the new user into the users collection
    const userCollection = await users();
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: await passwordHash.generate(password),
        nationality: nationality
    }
    const insertInfo = await userCollection.insertOne(newUser);

    //insertion failed
    if(insertInfo == null) throw new Error(errorMessages.userCreationError);
    if(insertInfo.insertedCount == 0) throw new Error(errorMessages.userCreationError);

    return true;  
}

module.exports = {addUser};