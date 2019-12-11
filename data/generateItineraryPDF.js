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
async function generateItineraryPDF(itinerary, userID, travelDates, destination, tourType, connection) {
    if (arguments.length != 6) {
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
    doc.pipe(fs.createWriteStream('public/uploads/itinerary.pdf'));
    doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Destination: " + `${destination}`);
    doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Travel Start Date: " + `${travelDates.start}`);
    doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Travel End Date: " + `${travelDates.end}`);
    doc.image('public/images/plane.jpg', 350, 35, { fit: [100, 100], align: 'right', valign: 'center' });
    doc.moveDown();
    let day = 1;
    for (var key in itinerary) {
        doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight() + 7).fill('#4a8ab4');
        doc.fillColor('white').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Day " + `${day}`);
        ++day;
        for (var index = 0; index < itinerary[key].length; index++) {
            doc.moveDown();
            let color;
            if (itinerary[key][index].group == 'thingToDo') {
                color = "#00b3b3";
            } else {
                color = "#ffaa00";
            }
            doc.fillColor(`${color}`).font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Name:" + `${itinerary[key][index].name}`);
            doc.fillColor(`${color}`).font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Address:" + `${itinerary[key][index].location}`);
            doc.fillColor(`${color}`).font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Average cost per person: $" + `${itinerary[key][index].avgCostPerPerson}`);

            if (itinerary[key][index].group == 'thingToDo') {
                doc.fillColor(`${color}`).font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Average time spent: " + `${itinerary[key][index].avgTimeSpent}` + " hr");
            } else {
                doc.fillColor(`${color}`).font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Type: Restaurant");
            }
        }
        doc.moveDown();
    }

    const destinationCollection = await destinations();
    const country = await destinationCollection.findOne({ 'd_name': destination });

    //Add Packing List
    doc.addPage();
    const packingList = await packingFunctions.generatePackingList(travelDates, country, tourType);
    doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight() + 7).fill('#4a8ab4');
    doc.fillColor('white').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Packing List");
    doc.moveDown();
    doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).list(packingList, { indent: 20, bulletIndent: 20, textIndent: 20, columns:2, columnGap:50, align: 'justify'})


    //Add Country Customs
    doc.addPage();
    if (country !== null) {
        doc.rect(20, doc.y, (page.width) - 40, doc.currentLineHeight() + 7).fill('#4a8ab4');
        doc.fillColor('white').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Country Customs");
        doc.moveDown();

        //Add Vaccinations
        let countryCustoms = country.countryCustoms;
        let vaccinations = countryCustoms.vaccinations;
        if (vaccinations.length == 0) {
            doc.fillColor('#4a8ab4').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Vaccinations: None");
        } else {
            vaccinations = vaccinations.toString();
            vaccinations.slice(1, vaccinations.length - 1);
            doc.fillColor('#4a8ab4').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Vaccinations: " + `${vaccinations}`);
        }
        doc.moveDown();

        //Add Cash Limit
        doc.fillColor('#4a8ab4').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Cash Limit: " + `${countryCustoms.cashLimit}`);
        doc.moveDown();

        //Add Prohibited Items
        doc.fillColor('#4a8ab4').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Prohibited Items:");
        for (index in countryCustoms.prohibitedItems) {
            let item = await itemFunctions.getProhibitedItemById(countryCustoms.prohibitedItems[index]);
            doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).list([`${item.item_name}`], { indent: 20, bulletIndent: 20, textIndent: 20 })
        }
        doc.moveDown();

        //Add Laws
        doc.fillColor('#4a8ab4').font('public/fonts/TitilliumWeb-Bold.ttf').fontSize(15).text("Local Laws:");
        for (index in countryCustoms.laws) {
            let law = await lawFunctions.getLawById(countryCustoms.laws[index]);
            doc.fillColor('#4a8ab4').font('public/fonts/Titillium-Regular.otf').fontSize(15).list([`${law.description}`], { indent: 20, bulletIndent: 20, textIndent: 20 })
        }
        doc.moveDown();

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

module.exports = {
    generateItineraryPDF, fetchUserItinerary, deleteLocalItinerary
}