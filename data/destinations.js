const errorMessages = require('../public/errorMessages');
const mongoCollections = require("../config/mongoCollections");
const destinations = mongoCollections.destinations;
const ObjectId = require("mongodb").ObjectID;

let exportedMethods = {
    /**
     * Creates a new destination data and inserts it into the destinations collection.
     * Then returns the inserted destination object. Throws errors if invalid arguments
     * were provided or insertion failed.
     * @param {*} d_name destination string name
     * @param {*} country destination country string name
     * @param {*} weather an array of weather data
     * @param {*} thingsToDo an array of places to visit
     * @param {*} restaurants an array of restaurants
     * @param {*} countryCustoms an object with multiple country customs
     * @returns destination the newly created destination object
     */
    async addDestination(d_name, country, weather, thingsToDo, restaurants, countryCustoms) {
        //validates number of arguments
        if (arguments.length != 6) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!d_name || typeof(d_name) != "string" || d_name.length == 0) {
            throw new Error(errorMessages.InvalidDestinationName);
        }   
        if (!country || typeof(country) != "string" || country.length == 0) {
            throw new Error(errorMessages.InvalidCountryName);
        }
        if (!weather || !Array.isArray(weather)) {
            throw new Error(errorMessages.InvalidWeatherArray);
        }
        if (!thingsToDo || !Array.isArray(thingsToDo)) {
            throw new Error(errorMessages.InvalidThingsToDoArray);
        }
        if (!restaurants || !Array.isArray(restaurants)) {
            throw new Error(errorMessages.InvalidRestaurantsArray);
        }
        if (!countryCustoms || typeof(countryCustoms) != "object") {
            throw new Error(errorMessages.InvalidcountryCustomsObject);
        }

        const destinationsCollection = await destinations();
        //prevents duplicated destination object to be inserted into the database
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
        if (!insertedDestination || insertedDestination.insertedCount === 0) {
            throw new Error(errorMessages.DestinationInsertionError);
        }
        
        //gets the inserted animal and returns it
        const newId = insertedDestination.insertedId;
        const destinationResult = await this.getDestinationById(newId.toString()); 
        return destinationResult; 
    },
    /** 
     * Finds the destination object that has the same id as the provided one.
     * Returns the destination object found else throws error if invalid argument type
     * was provided or no destination object was found.
     * @param destinationId destination string
     * @return destination object
    */
    async getDestinationById(destinationId) {
        
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidCountryName);
        }
        
        //gets the specific destination
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (!singleDestination) {
            throw new Error(errorMessages.DestinationNotFound);
        }
        
        return singleDestination;
    },
    /**
     * Removes a specfic destination object with id equal to the provided one.
     * Throws error if invalid destination id was provided or deletion failed.
     * @param {*} destinationId 
     * @returns destination object 
     */
    async deleteDestinationById(destinationId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }

        //removes the destination from the database
        const destinationsCollection = await destinations();
        const removedDestination = await destinationsCollection.removeOne({_id: ObjectId(destinationId)});
        if (!removedDestination || removedDestination.deletedCount == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        
        return removedDestination;
    },
    /** 
     * Gets all the destination data within the destinations collection then returns
     * them as an array. Throws error if argument is provided.
     * @returns an array of destination objects
    */
    async getAllDestinations() {
        if (arguments.length != 0) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        const destinationsCollection = await destinations();
        const allDestinations = await destinationsCollection.find({}).toArray();
        
        return allDestinations;
    },
    /**
     * Adds the provided law id to a specific destination. 
     * Throws error if invalid number of arguments are provided or update failed..
     * 
     * @param destinationId destination id in string format
     * @param lawId law id in string format
     */
    async addLaw(destinationId, lawId) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }

        if (!lawId || typeof(lawId) != "string" || lawId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {"countryCustoms.laws": lawId}});
        if (!updatedDestination || updatedDestination.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
        return this.getDestinationById(destinationId);        
    },
    /**
     * Adds the provided prohibited item id to a specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string format
     * @param itemId item id in string format
     */
    async addProhibitedItem(destinationId, itemId) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!itemId || typeof(itemId) != "string" || itemId.length == 0) {
            throw new Error(errorMessages.InvalidProhibitedItemId);
        }

        //add the new item into prohibited item array
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {"countryCustoms.prohibitedItems": itemId}});
        if (!updatedDestination || updatedDestination.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
        return this.getDestinationById(destinationId);
    },
    /**
     * Adds the provided restaurant object to a specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string format
     * @param newRestaurant new restaurant object
     */
    async addRestaurantToDest(destinationId, newRestaurant) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!newRestaurant || typeof(newRestaurant) != "object") {
            throw new Error(errorMessages.InvalidRestaurantObject);
        }
        //add new restaurant to the destination
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {restaurants: newRestaurant}});
        if (!updatedDestination || updatedDestination.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
    
        return this.getDestinationById(destinationId);
    },
    /**
     * Adds the provided thingToDo object into a specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string format
     * @param newThing new newThing object
     */
    async addThingToDo(destinationId, newThing) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!newThing || typeof(newThing) != "object") {
            throw new Error(errorMessages.InvalidThingToDoObject);
        }
        //add new restaurant to the destination
        const destinationsCollection = await destinations();
        const updatedDestination = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$addToSet: {thingsToDo: newThing}});
        if (!updatedDestination || updatedDestination.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }

        return this.getDestinationById(destinationId);
    },
    /**
     * Gets all the laws of a specific destination. 
     * Throws error if invalid number of arguments are provided or query failed.
     * @param destinationId destination id in string format
     */
    async getAllLaws(destinationId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }

        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (!singleDestination) {
            throw new Error(errorMessages.DestinationNotFound);
        }
        
        return singleDestination.countryCustoms.laws;
    },
    /**
     * Gets all the prohibited items of a specific destination. 
     * Throws error if invalid number of arguments are provided or query failed.
     * @param destinationId destination id in string format
     */
    async getAllProhibitedItems(destinationId) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        //add the law to destination.countryCustoms
        const destinationsCollection = await destinations();
        const singleDestination = await destinationsCollection.findOne({_id: ObjectId(destinationId)});
        if (!singleDestination) {
            throw new Error(errorMessages.DestinationNotFound);
        }
        return singleDestination.countryCustoms.prohibitedItems;
    },
    /**
     * Removes a specific law with matching id within specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string 
     * @param lawId law id in string format
     */
    async removeLawById(destinationId, lawId) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!lawId || typeof(lawId) != "string" || lawId.length == 0) {
            throw new Error(errorMessages.InvalidLawId);
        }
        //removes the law
        const destinationsCollection = await destinations();
        const removedLaw = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$pull: {"countryCustoms.laws": lawId}});
        if (!removedLaw || removedLaw.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
        return lawId;
    },
    /**
     * Removes a prohibited item with matching id within specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string 
     * @param itemId prohibited id in string format
     */
    async removeProhibitedItem(destinationId, itemId) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!itemId || typeof(itemId) != "string" || itemId.length == 0) {
            throw new Error(errorMessages.InvalidProhibitedItemId);
        }

        const destinationsCollection = await destinations();
        const removedItem = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$pull: {"countryCustoms.prohibitedItems": itemId}});
        if (!removedItem || removedItem.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }

        return itemId;
    },
    /**
     * Removes a restaurant with matching name within specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string 
     * @param restaurantName restaurant name in string format
     */
    async removeRestaurant(destinationId, restaurantName) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!restaurantName || typeof(restaurantName) != "string" || restaurantName.length == 0) {
            throw new Error(errorMessages.InvalidRestaurantName);
        }

        //removes the restaurant from destination object
        const destinationsCollection = await destinations();
        const removedRestaurant = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$pull: {"restaurants": {"name": restaurantName}}});
        if (!removedRestaurant || removedRestaurant.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
        return restaurantName;
    },
    /**
     * Removes a specific thingToDo matching name within specific destination. 
     * Throws error if invalid number of arguments are provided or update failed.
     * @param destinationId destination id in string 
     * @param newThing thingToDo name in string format
     */
    async removeThingToDo(destinationId, newThing) {
        //validates number of arguments
        if (arguments.length != 2) {
            throw new Error(errorMessages.wrongNumberOfArguments);
        }
        //validates arguments type
        if (!destinationId || typeof(destinationId) != "string" || destinationId.length == 0) {
            throw new Error(errorMessages.InvalidDestinationId);
        }
        if (!newThing || typeof(newThing) != "string" || newThing.length == 0) {
            throw new Error(errorMessages.InvalidThingsToDoName);
        }

        //removes the thingToDo objecct
        const destinationsCollection = await destinations();
        const removedItem = await destinationsCollection.updateOne({_id: ObjectId(destinationId)}, {$pull: {"thingsToDo": {"name": newThing}}});
        if (removedItem.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
        return newThing;
    }
};

module.exports = exportedMethods;