const dubaiData = require("./Destination/dubai.json");
const errorMessages = require('../public/errorMessages');
const mongoCollections = require("../config/mongoCollections");
const destinations = mongoCollections.destinations;
const ObjectId = require("mongodb").ObjectID;

let exportedMethods = {
    testPrint() {
        console.log(`dubai d_name = ${dubaiData.d_name}`)
    },
    /** 
     * Returns true if the passed-in string is valid, else throws error.
     * 
     * @param str the string needs to be validated.
     * @param str_name the name of the passed-in string.
     * @returns boolean indicates whether the passed-in string valid or not.
    */
    validateStr(str, str_name) {
        if (str === undefined) {
            throw `The ${str_name} is undefined!`;
        } else if (str == null) {
            throw `The ${str_name} is null!`;
        } else if (typeof str != "string") {
            throw `The ${str_name} is not a string!`;
        } else if (str.length == 0) {
            throw `The ${str_name} string has zero length!`
        } else {
            return true;
        }
    },
    /**
     * Creates a new destination data and inserts it into the destinations collection.
     * Then returns the inserted destination object.
     * Throws error if invalid arguments were provided or insertion failed.
     * @param {*} d_name destination string name
     * @param {*} country destination country string name
     * @param {*} weather an array of weather data
     * @param {*} thingsToDo an array of places to visit
     * @param {*} restaurants an array of restaurants
     * @param {*} countryCustoms an object with multiple country customs
     * @returns destination the newly created destination object
     */
    async addDestination(d_name, country, weather, thingsToDo, restaurants, countryCustoms) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 6) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!d_name || typeof(d_name) != "string" || d_name.length == 0) {
            errors.push(errorMessages.InvalidDestinationName);
        }   
        if (!country || typeof(country) != "string" || country.length == 0) {
            errors.push(errorMessages.InvalidCountryName);
        }
        if (!weather || !Array.isArray(weather)) {
            errors.push(errorMessages.InvalidWeatherArray);
        }
        if (!thingsToDo || !Array.isArray(thingsToDo)) {
            errors.push(errorMessages.InvalidThingsToDoArray);
        }
        if (!restaurants || !Array.isArray(restaurants)) {
            errors.push(errorMessages.InvalidRestaurantsArray);
        }
        if (!countryCustoms || typeof(countryCustoms) != "object") {
            errors.push(errorMessages.InvalidcountryCustomsObject);
        }

        if(errors.length > 0) return errors;

        //checks if destination already exists


        //crreates new destination
        const destinationsCollection = await destinations();
        destinationsCollection.createIndex({"d_name":1},{unique:true});
        let newDestination = {
            d_name: d_name,
            country: country,
            weather: weather,
            packingList: [],
            thingsToDo: thingsToDo,
            restaurants: restaurants,
            countryCustoms: countryCustoms
        };
        const insertedDestination = await destinationsCollection.insertOne(newDestination);
        //checks if destination data was inserted correctly
        if (insertedDestination.insertedCount === 0) {
            errors.push(errorMessages.DestinationInsertionError);
        }

        if(errors.length > 0) return errors;
        //gets the inserted animal and returns it
        const newId = insertedDestination.insertedId;
        const destinationResult = await this.getDestinationById(newId.toString()); 
        return destinationResult; 
    },
    async getDestinationById(destinationId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 1) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidCountryName);
        }
        if(errors.length > 0) return errors;
        //gets the specific destination
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (singleDestination == null) {
            errors.push(errorMessages.DestinationNotFound);
        }
        if(errors.length > 0) return errors;
        return singleDestination;
    },
    /** */
    async updateDestination(destinationId, destination) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if (!destination || typeof(destination) != "object") {
            errors.push(errorMessages.InvalidDestinationObject);
        }
        if(errors.length > 0) return errors;

        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$set: destination});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;
        return await this.getDestinationById(destinationId);
    },
    /**
     * Removes a specfic destination data with id equal to the provided one.
     * Throws error if invalid destination id was provided.
     * @param {*} destinationId 
     */
    async deleteDestinationById(destinationId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 1) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if(errors.length > 0) return errors;

        const destinationsCollection = await destinations();
        const removedDestination = await destinationsCollection.removeOne({_id: ObjectId(destinationId)});
        if (removedDestination.deletedCount == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if(errors.length > 0) return errors;

        return removedDestination;
    },
    /** 
     * Gets all the destination data within the destinations collection then returns
     * them as an array.
    */
    async getAllDestinations() {
        if (arguments.length != 0) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        const destinationsCollection = await destinations();
        const allDestinations = await destinationsCollection.find({}).toArray();
        
        return allDestinations;
    },
    async addLaw(destinationId, lawId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if (!lawId || typeof(lawId) != "string" || lawId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if(errors.length > 0) return errors;

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {"countryCustoms.laws": lawId}});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;

        return this.getDestinationById(destinationId);        
    },
    async addProhibitedItem(destinationId, itemId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if (!itemId || typeof(itemId) != "string" || itemId.length == 0) {
            errors.push(errorMessages.InvalidProhibitedItemId);
        }
        if(errors.length > 0) return errors;

        //add the new item into prohibited item array
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {"countryCustoms.prohibitedItems": itemId}});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;

        return this.getDestinationById(destinationId);
    },
    async addPackingList(destinationId, packingListID) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if (!packingListID || typeof(packingListID) != "string" || packingListID.length == 0) {
            errors.push(errorMessages.InvalidPackingList);
        }
        if(errors.length > 0) return errors;

        //add the new packing list
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {packingList: packingListID}});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;

        return this.getDestinationById(destinationId);
    },
    async addRestaurantToDest(destinationId, newRestaurant) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if (!newRestaurant || typeof(newRestaurant) != "object") {
            errors.push(errorMessages.InvalidRestaurantObject);
        }

        if(errors.length > 0) return errors;

        //add new restaurant to the destination
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {restaurants: newRestaurant}});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;

        return this.getDestinationById(destinationId);
    },
    async addThingToDest(destinationId, newThing) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 2) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }
        if (!newThing || typeof(newThing) != "object") {
            errors.push(errorMessages.InvalidThingToDoObject);
        }

        if(errors.length > 0) return errors;

        //add new restaurant to the destination
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {thingsToDo: newThing}});
        if (updatedDestination.modifiedCount === 0) {
            errors.push(errorMessages.UpdateDestinationError);
        }
        if(errors.length > 0) return errors;

        return this.getDestinationById(destinationId);
    },
    async getAllLaws(destinationId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 1) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if(errors.length > 0) return errors;

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (singleDestination == null) {
            errors.push(errorMessages.DestinationNotFound);
        }
        if(errors.length > 0) return errors;
        return singleDestination.countryCustoms.laws;
    },
    async getAllProhibitedItems(destinationId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 1) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if(errors.length > 0) return errors;

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (singleDestination == null) {
            errors.push(errorMessages.DestinationNotFound);
        }
        if(errors.length > 0) return errors;
        return singleDestination.countryCustoms.prohibitedItems;
    },
    async getAllPackingList(destinationId) {
        let errors = [];
        //validates number of arguments
        if (arguments.length != 1) {
            errors.push(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            errors.push(errorMessages.InvalidDestinationId);
        }

        if(errors.length > 0) return errors;

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (singleDestination == null) {
            errors.push(errorMessages.DestinationNotFound);
        }
        if(errors.length > 0) return errors;
        return singleDestination.packingList;
    }
};

module.exports = exportedMethods;