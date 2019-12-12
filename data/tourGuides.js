const errorMessages = require('../public/errorMessages');
const mongoCollections = require("../config/mongoCollections");
const tourGuides = mongoCollections.tourGuides;
const ObjectId = require("mongodb").ObjectID;

let exportedMethods = {
    /** 
     * Creates a new tour guide data and inserts it into the tourGuides collection.
     * Then returns the inserted tour guide object. Throws errors if invalid arguments
     * were provided or insertion failed.
     * @param {*} name tour guide string name
     * @param {*} email tour guide email string
     * @param {*} phone tour guide phone number string
     * @param {*} dailyCost tour guide daily cost integer
     * @param {*} city tour guide service city
     * @param {*} language an array of languages spoken by tour guide
     * @returns tourGuideResult the newly created tour guide object
    */
    async addTourGuide(name, email, phone, dailyCost, city, language) {
        //validates number of arguments
        if (arguments.length != 6) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!name || typeof(name) != "string" || name.length == 0) {
            throw new Error(errorMessages.InvalidTourGuideName);
        }
        if (!email || typeof(email) != "string" || email.length == 0) {
            throw new Error(errorMessages.InvalidTourGuideEmail);
        }
        if (!phone || typeof(phone) != "string" || phone.length == 0) {
            throw new Error(errorMessages.InvalidTourGuidePhone);
        }
        if (!dailyCost || typeof(dailyCost) != "number") {
            throw new Error(errorMessages.InvalidTourGuideCost);
        }
        if (!city || typeof(city) != "string" || city.length == 0) {
            throw new Error(errorMessages.InvalidTourGuideCity);
        }
        if (!language || !Array.isArray(language)) {
            throw new Error(errorMessages.InvalidTourGuideLanguage);
        }

        const tourGuideCollection = await tourGuides();
        //prevents duplicated tour guide object to be inserted into the database
        tourGuideCollection.createIndex({"name":1},{unique:true});
        let newTourGuide = {
            name: name,
            email: email,
            phone: phone,
            dailyCost: dailyCost,
            city: city,
            language: language
        };
        const insertedTourGuide = await tourGuideCollection.insertOne(newTourGuide);
        
        //checks if tour guide data was inserted correctly
        if (!insertedTourGuide || insertedTourGuide.insertedCount === 0) {
            throw new Error(errorMessages.TourGuideInsertionError);
        }
        
        //gets the inserted tour guide and returns it
        const newId = insertedTourGuide.insertedId;
        const tourGuideResult = await this.getTourGuideById(newId.toString()); 
        return tourGuideResult; 
    },

    /** 
     * Finds the tour guide object that has the same id as the provided one.
     * Returns the tour guide object found else throws error if invalid argument type
     * was provided or no tour guide object was found.
     * 
     * @param tourGuideId tour guide id in string format
     * @returns singleTourGuide single tour guide object
    */
    async getTourGuideById(tourGuideId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!tourGuideId || typeof(tourGuideId) != "string" || tourGuideId.length == 0) {
            throw new Error(errorMessages.InvalidTourGuideId);
        }

        //gets the specific tour guide
        const tourGuideCollection = await tourGuides();
        const singleTourGuide = await tourGuideCollection.findOne({_id: ObjectId(tourGuideId)});
        if (!singleTourGuide) {
            throw new Error(errorMessages.TourGuideNotFound);
        }
        
        return singleTourGuide;
    },

    /** 
     * Finds the tour guide object that has the same city as the provided one.
     * Returns the tour guide object found else throws error if invalid argument type
     * was provided or no tour guide object was found.
     * 
     * @param cityName tour guide city in string format
     * @returns tourGuideList an array of tour guide within the given city
    */
    async getTourGuidesByCity(cityName) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!cityName || typeof(cityName) != "string" || cityName.length == 0) {
            throw new Error(errorMessages.InvalidTourGuideCity);
        }

        //gets the specific tour guide
        const tourGuideCollection = await tourGuides();
        const tourGuideList = await tourGuideCollection.find({city: cityName}).toArray();
        if (!tourGuideList) {
            throw new Error(errorMessages.TourGuideNotFound);
        }
        
        return tourGuideList;
    }
};

module.exports = exportedMethods;