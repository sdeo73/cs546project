const errorMessages = require('../public/errorMessages');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const passwordHash = require('password-hash');

async function addUser(firstName, lastName, email, password, nationality){
    let errors = [];
    if(!firstName)
        errors.push(errorMessages.firstNameMissing);
    if(!lastName)
        errors.push(errorMessages.lastNameMissing);
    if(!email)
        errors.push(errorMessages.emailMissing);
    if(!password)
        errors.push(errorMessages.passwordMissing);
    if(!nationality)
        errors.push(errorMessages.nationalityMissing);
        
    if(errors.length > 0) return errors;

    const userCollection = await users();

    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: await passwordHash.generate(password),
        nationality: nationality
    }

    const insertInfo = await userCollection.insertOne(newUser);

    if(insertInfo == null) throw new Error(errorMessages.userCreationError);
    
    if(insertInfo.insertedCount == 0) throw new Error(errorMessages.userCreationError);

    return true;  
}

module.exports = {addUser};