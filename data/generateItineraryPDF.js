const errorMessages = require('../public/errorMessages');
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');
const mongodb = require('mongodb');
const PDFDocument = require('pdfkit');
const mongoCollections = require("../config/mongoCollections");
const destinations = mongoCollections.destinations;
const itemFunctions = require("../data/prohibitedItems");
const lawFunctions = require("../data/laws");
const packingFunctions = require("../data/packing");
const fs = require('fs');

/**
 * Function to convert the itnerary object data into PDF format for user display
 * @param {*} itinerary Object containing daily itinerary
 * @param {*} userID The user ID for whom the itinerary is being generated
 * @param {*} connection Mongo connection
 */
async function generateItineraryPDF(itinerary, userID, travelDates, destination, tourType, totalSpent, connection) {
    if (arguments.length != 7) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if (!itinerary) {
        throw new Error(errorMessages.itineraryUndefined);
    }

    if (!userID) {
        throw new Error(errorMessages.userIDMissing);
    } else if (!ObjectId.isValid) {
        throw new Error(errorMessages.userIDInvalid);
    }

    //Check if local copy already exists
    const path = 'public/uploads/itinerary.pdf';
    if (fs.existsSync(path)) {
        deleteLocalItinerary();
    }

    //Initialize Mongo GridFs Bucket
    var bucket = new mongodb.GridFSBucket(connection, {
        bucketName: 'itineraries'
    });

    //Delete existing itinerary from DB
    await deleteItineraryFromDatabase(userID, bucket);

    //Initialize new PDF document
    let doc = new PDFDocument();
    let page = doc.page;
    doc.registerFont('Regular', 'public/fonts/TitilliumWeb-Regular.ttf');
    doc.registerFont('Bold', 'public/fonts/TitilliumWeb-Bold.ttf');
    doc.registerFont('SemiBold', 'public/fonts/TitilliumWeb-SemiBold.ttf');

    doc.pipe(fs.createWriteStream('public/uploads/itinerary.pdf'));
    doc.fillColor('#4a8ab4').font('Regular').fontSize(14).text("Destination: " + `${destination}`);
    doc.fillColor('#4a8ab4').font('Regular').fontSize(14).text("Travel Start Date: " + `${travelDates.start}`);
    doc.fillColor('#4a8ab4').font('Regular').fontSize(14).text("Travel End Date: " + `${travelDates.end}`);
    doc.fillColor('#4a8ab4').font('Regular').fontSize(14).text("Total Cost: $" + `${totalSpent}`);
    doc.image('public/images/plane.jpg', 350, 35, { fit: [100, 100], align: 'right', valign: 'center' });
    doc.moveDown();
    let day = 1;
    for (var key in itinerary) {
        doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight()).fill('#4a8ab4');
        doc.fillColor('white').font('Bold').fontSize(14).text("Day " + `${day}`);
        ++day;
        doc.moveDown();

        //Add all restaurants 
        doc.fillColor('#00b3b3').font('Bold').fontSize(14).text("Restaurants:");
        for (let index = 0; index < itinerary[key].length; index++) {
            if (itinerary[key][index].group == 'restaurant') {
                let cuisine = itinerary[key][index].cuisine;
                let mealPreference = constructMealPreference(itinerary[key][index].mealPreferences);
                let specialNeeds = itinerary[key][index].specialNeeds ? 'Yes' : 'No';
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Name: ", { continued: true }).font('Regular').text(`${itinerary[key][index].name}`);
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Address: ", { continued: true }).font('Regular').text(`${itinerary[key][index].location}`);
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Cuisine: ", { continued: true }).font('Regular').text(`${cuisine.slice(0, cuisine.length)}`);
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Meal Type: ", { continued: true }).font('Regular').text(`${mealPreference.slice(0, mealPreference.length)}`);
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Average Cost Per Person: $", { continued: true }).font('Regular').text(`${itinerary[key][index].avgCostPerPerson}`);
                doc.fillColor('#00b3b3').font('SemiBold').fontSize(14).text("Special Needs Assistance: ", { continued: true }).font('Regular').text(`${specialNeeds}`);
                doc.moveDown();
            }
        }

        //Add all things to do
        doc.fillColor('#ffaa00').font('Bold').fontSize(14).text("Things To Do:");
        for (let index = 0; index < itinerary[key].length; index++) {
            if (itinerary[key][index].group == 'thingToDo') {
                let specialNeeds = itinerary[key][index].specialNeeds ? 'Yes' : 'No';
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Name: ", { continued: true }).font('Regular').text(`${itinerary[key][index].name}`);
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Address: ", { continued: true }).font('Regular').text(`${itinerary[key][index].location}`);
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Type: ", { continued: true }).font('Regular').text(`${itinerary[key][index].type}`);
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Average Time Spent: ", { continued: true }).font('Regular').text(`${itinerary[key][index].avgTimeSpent}` + " hr");
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Average Cost Per Person: $", { continued: true }).font('Regular').text("Average cost per person: $" + `${itinerary[key][index].avgCostPerPerson}`);
                doc.fillColor('#ffaa00').font('SemiBold').fontSize(14).text("Special Needs Assistance: ", { continued: true }).font('Regular').text(`${specialNeeds}`);
                doc.moveDown();
            }
        }
    }

    const destinationCollection = await destinations();
    const country = await destinationCollection.findOne({ 'd_name': destination });

    //Add Packing List
    doc.addPage();
    const packingList = await packingFunctions.generatePackingList(travelDates, country, tourType);
    doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight()).fill('#4a8ab4');
    doc.fillColor('white').font('Bold').fontSize(14).text("Packing List", { lineBreak: true, align: 'left' });
    doc.moveDown();
    doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(packingList, { indent: 20, bulletIndent: 20, textIndent: 20, columns: 2, columnGap: 50, align: 'justify' })


    //Add Country Customs
    doc.addPage();
    if (country !== null) {
        doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight()).fill('#4a8ab4');
        doc.fillColor('white').font('Bold').fontSize(14).text("Country Customs");
        doc.moveDown();

        //Add Vaccinations
        let countryCustoms = country.countryCustoms;
        let vaccinations = countryCustoms.vaccinations;
        if (vaccinations.length == 0) {
            doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Vaccinations: None");
        } else {
            vaccinations = vaccinations.toString();
            vaccinations.slice(1, vaccinations.length - 1);
            doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Vaccinations: " + `${vaccinations}`);
        }

        //Add Cash Limit
        doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Cash Limit: $" + `${countryCustoms.cashLimit}`);
        doc.moveDown();

        //Add Prohibited Items
        doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Prohibited Items:");
        for (index in countryCustoms.prohibitedItems) {
            let item = await itemFunctions.getProhibitedItemById(countryCustoms.prohibitedItems[index]);
            doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list([`${item.item_name}`], { bulletIndent: 20, textIndent: 20, align: 'justify' })
        }
        doc.moveDown();

        //Add Laws
        doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Local Laws:");
        for (index in countryCustoms.laws) {
            doc.text("");
            let law = await lawFunctions.getLawById(countryCustoms.laws[index]);
            doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list([`${law.description}`], { bulletIndent: 20, textIndent: 20, align: 'left' })
        }
        doc.moveDown();

        //Add Emergency Contacts
        doc.fillColor('#4a8ab4').font('Bold').fontSize(14).text("Emergency Contacts:");
        let emergencyContact = countryCustoms.emergencyContacts;
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Police: " + `${emergencyContact.police}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Ambulance: " + `${emergencyContact.ambulance}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Fire Department: " + `${emergencyContact.fireDepartment}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Coastguard: " + `${emergencyContact.coastguard}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Electricity Concern: " + `${emergencyContact.electricityFailure}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
        doc.fillColor('#4a8ab4').font('Regular').fontSize(14).list(["Water Concern: " + `${emergencyContact.waterFailure}`], { bulletIndent: 20, textIndent: 20, align: 'justify' });
    }

    doc.end();

    //Referred from https://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/

    await fs.createReadStream('public/uploads/itinerary.pdf').
        pipe(bucket.openUploadStream(userID)).
        on('error', function (error) {
            assert.ifError(error);
        }).
        on('finish', function () {
            assert.ok("Done");
        });
    return true;
}

/**
 * Function to fetch itinerary from the database 
 * @param {*} userID The user ID for whom the itinerary is being generated
 * @param {*} connection Mongo connection
 */
async function fetchUserItinerary(userID, connection) {
    if (!userID) {
        throw new Error(errorMessages.userIDMissing);
    } else if (!ObjectId.isValid) {
        throw new Error(errorMessages.userIDInvalid);
    }

    //Check if local copy already exists
    const path = 'public/uploads/itinerary.pdf';
    if (fs.existsSync(path)) {
        deleteLocalItinerary();
    }

    var bucket = new mongodb.GridFSBucket(connection, {
        bucketName: 'itineraries'
    });

    //Fetch pdf from database
    await bucket.openDownloadStreamByName(userID).
        pipe(fs.createWriteStream('public/uploads/itinerary.pdf')).
        on('error', function (error) {
            assert.ifError(error);
        }).
        on('finish', function () {
            assert.ok("Done");
        });
    return true;
}

/**
 * Function to delete the local copy of the itinerary
 */
function deleteLocalItinerary() {
    fs.unlink('public/uploads/itinerary.pdf', function (error) { //Referred from https://arjunphp.com/how-to-delete-a-file-in-node-js/
        if (error) {
            throw new Exception(error.message);
        }
    });
}

/**
 * Function to delete itinerary from database if it exists
 * @param {*} userID The user ID for whom the itinerary is being generated
 * @param {*} bucket The initialized gridFS bucket
 */
async function deleteItineraryFromDatabase(userID, bucket) {
    if (arguments.length != 2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }

    if (!userID) {
        throw new Error(errorMessages.userIDMissing);
    } else if (!ObjectId.isValid) {
        throw new Error(errorMessages.userIDInvalid);
    }

    const file = await bucket.find({ filename: userID }).toArray();
    if (file.length != 0) {
        bucket.delete(file[0]._id);
    }
}

function constructMealPreference(mealPreference) {
    if (arguments.length !== 1) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    }

    for (index in mealPreference) {
        if (mealPreference[index] == 'vegan') {
            mealPreference[index] = 'Vegan';
        } else if (mealPreference[index] == 'vegetarian') {
            mealPreference[index] = 'Vegetarian';
        } else if (mealPreference[index] == 'whiteMeat') {
            mealPreference[index] = 'White Meat';
        } else if (mealPreference[index] == 'redMeat') {
            mealPreference[index] = 'Red Meat';
        } else if (mealPreference[index] == 'seafood') {
            mealPreference[index] = 'Seafood';
        } else if (mealPreference[index] == 'eggs') {
            mealPreference[index] = 'Eggs';
        }
    }

    return mealPreference;
}

module.exports = {
    generateItineraryPDF, fetchUserItinerary, deleteLocalItinerary
}