const errorMessages = require('../public/errorMessages');
const ObjectId = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

async function loginValidation(user_email, user_pass) {
    
}