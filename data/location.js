const NodeGeocoder = require('node-geocoder');
const geoDist = require('geodist');
const fs = require('fs');
const zomato = require('zomato-api');
const errorMessages = require('../public/errorMessages');

/**
 * Returns coordinates of any address.
 * @param {*} address address string
 * @returns array of coordinates. 0th position is lat, 1st position is long
 */

async function getCoordinates(address){
    if(arguments.length != 1 || !address) throw new Error(errorMessages.locationAddressMissing);
    if(typeof address !== 'string') throw new Error(errorMessages.locationAddressIncorrectType);

    const options = {
        provider: 'google',
        httpAdapter: 'https',
        apiKey: 'AIzaSyAiY3f3GzIbijhIkRyPPzC-83YGj7rldLI',
        formatter: null
    };
    
    const geocoder = NodeGeocoder(options);

    try {
        const location = await geocoder.geocode(address);
        latitude = location[0].latitude;
        longitude = location[0].longitude;
        return [latitude,longitude];
    } catch (error) {
        console.log(error);
    }
}

/**
 * Calculates distance between 2 sets of coordinates.
 * @param {*} lat_source source lat number
 * @param {*} long_source source long number
 * @param {*} lat_dest dest lat number
 * @param {*} long_dest dest long number
 * @returns distance between the coordinates number
 */

async function calculateDistance(lat_source, long_source, lat_dest, long_dest){
    if(arguments.length != 4 || !lat_source || !long_source || !lat_dest || !long_dest)
        throw new Error(errorMessages.locationCoordinateMissing);
    
    if(Number.isNaN(lat_source) || Number.isNaN(long_source) || Number.isNaN(lat_dest) || Number.isNaN(long_dest))
        throw new Error(errorMessages.locationCoordinateIncorrectType);

    const source = {
        lat: lat_source,
        long: long_source
    };

    const dest = {
        lat: lat_dest,
        long: long_dest
    };

    const distance = await geoDist(source, dest, {unit: 'km'});

    return distance;
}

/**
 * Checks if distance between 2 sets of coordinates is less than a specific value.
 * @param {*} lat_source source lat number
 * @param {*} long_source source long number
 * @param {*} lat_dest dest lat number
 * @param {*} long_dest dest long number
 * @param {*} maxDistance maximum distance threshold integer
 * @returns true if distance is less than max boolean
 */

async function near(lat_source, long_source, lat_dest, long_dest, maxDistance){
    if(arguments.length != 5 || !lat_source || !long_source || !lat_dest || !long_dest || !maxDistance)
        throw new Error(errorMessages.locationCoordinateDistanceMissing);
    
    if(Number.isNaN(lat_source) || Number.isNaN(long_source) || Number.isNaN(lat_dest) || Number.isNaN(long_dest) || !Number.isInteger(maxDistance))
        throw new Error(errorMessages.locationCoordinateDistanceIncorrectType);

    const source = {
        lat: lat_source,
        long: long_source
    };

    const dest = {
        lat: lat_dest,
        long: long_dest
    };

    const distance = await geoDist(source, dest, {unit: 'km'});

    if(distance < maxDistance) return true;

    else return false;

}

/**
 * Checks if distance between 2 addresses is less than a specific value.
 * @param {*} address_1 source address string
 * @param {*} address_2 destination address string
 * @param {*} maxDistance maximum distance threshold integer
 * @returns true if distance is less than max boolean
 */

async function nearAddress(address_1, address_2, maxDistance){
    if(arguments.length != 3 || !address_1 || !address_2 || !maxDistance)
        throw new Error(errorMessages.locationAddressDistanceMissing);
    
    if(typeof address_1 !== 'string' || typeof address_2 !== 'string' || !Number.isInteger(maxDistance))
        throw new Error(errorMessages.locationAddressDistanceIncorrectType);


    const source = await getCoordinates(address_1);
    const dest = await getCoordinates(address_2);

    const lat_source = source[0];
    const long_source = source[1];
    const lat_dest = dest[0];
    const long_dest = dest[1];

    const nearAdd = await near(lat_source, long_source, lat_dest, long_dest, maxDistance);

    return nearAdd;
}

/**
 * Calculates distance between 2 addresses.
 * @param {*} address_1 source address string
 * @param {*} address_2 destination address string
 * @returns distance between the addresses number
 */

async function calculateDistanceAddress(address_1, address_2){
    if(arguments.length !== 2 || !address_1 || !address_2)
        throw new Error(errorMessages.locationAddressMissing);
    if(typeof address_1 !== 'string' || typeof address_2 !== 'string')
        throw new Error(errorMessages.locationAddressIncorrectType);

    const source = await getCoordinates(address_1);
    const dest = await getCoordinates(address_2);

    const lat_source = source[0];
    const long_source = source[1];
    const lat_dest = dest[0];
    const long_dest = dest[1];

    const distance = await calculateDistance(lat_source, long_source, lat_dest, long_dest);

    return distance;
}

/**
 * Finds popular restaurants close to given coordinates.
 * It then populates restaurant array in given destination file
 * @param {*} lat latitude number
 * @param {*} lon longitude number
 * @param {*} filePath path of destination file to populate with restaurants
 * @param {*} currencyConversionFactor Currency conversion factor with respect to US Dollar for given destination number
 */

async function getNearbyRestaurants(lat, lon, filePath, currencyConversionFactor){
    if(arguments.length !== 4 || !lat || !lon || !filePath || !currencyConversionFactor)
        throw new Error(errorMessages.locationArgumentMissing);
    
    if(Number.isNaN(lat) || Number.isNaN(lon) || typeof filePath !== 'string' || Number.isNaN(currencyConversionFactor))
        throw new Error(errorMessages.locationArgumentIncorrectType);

    const client = zomato({
        userKey: 'b51206333a15d84a0ef0b2cda6885cc5'
    });
    let response = await client.getGeocode({lat: lat, lon: lon});
    let destination = require(filePath);
    let nearby_restaurants = response.nearby_restaurants;
    let restaurants = destination.restaurants;
    let restaurant = {};

    for(let i=0; i< nearby_restaurants.length; i++){
        restaurant.name = nearby_restaurants[i].restaurant.name;
        restaurant.location = nearby_restaurants[i].restaurant.location.address;
    
        let cuisines = nearby_restaurants[i].restaurant.cuisines;
        cuisine = cuisines.split(', ');
        restaurant.cuisine = cuisine;
        restaurant.avgCostPerPerson = Math.round(((nearby_restaurants[i].restaurant.average_cost_for_two)/2)*currencyConversionFactor);
        let index = restaurants.findIndex(x => x.name==restaurant.name);
        if(index == -1)
            restaurants.push(Object.assign({}, restaurant));
    }

    destination.restaurants = restaurants;
    
    fs.writeFile(filePath, JSON.stringify(destination, null, "\t"), function(err){
        if(err) throw err;
    });
}


module.exports = {getCoordinates, calculateDistance, near, nearAddress, calculateDistanceAddress, getNearbyRestaurants};