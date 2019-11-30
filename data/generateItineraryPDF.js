const knapsack = require('./knapsack');
const errorMessages = require('../public/errorMessages');
const ObjectId = require('mongodb').ObjectID;
const mongoConnection = require("./../config/mongoConnection");
const mongoCollections = require("./../config/mongoCollections");
const users = mongoCollections.users;
const assert = require('assert');
const mongodb = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Function to convert the itnerary object data into PDF format for user display
 * @param {*} itinerary Object containing daily itinerary
 */
async function generateItineraryPDF(itinerary, userID) {
    if(arguments.length!=2) {
        throw new Error(errorMessages.wrongNumberOfArguments);
    } else if(!itinerary) {
        throw new Error(errorMessages.itineraryUndefined);
    }

    if(!userID) {
        throw new Error(errorMessages.userIDMissing);
    } else if(!ObjectId.isValid) {
        throw new Error(errorMessages.userIDInvalid);
    }

    //Initialize new PDF document
    let doc = new PDFDocument();

    doc.pipe(fs.createWriteStream('itinerary.pdf'));
    let day=1;
    for(var key in itinerary) {
        doc.font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Day "+`${day}`);
        ++day;
        for(var index=0;index<itinerary[key].length;index++) {
            doc.font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Name:"+`${itinerary[key][index].name}`);
            doc.font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Address:"+`${itinerary[key][index].location}`);
            doc.font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Average cost per person: $"+`${itinerary[key][index].avgCost}`);
            doc.font('public/fonts/Titillium-Regular.otf').fontSize(15).text("Average time spent: "+`${itinerary[key][index].avgTimeSpent}`+" hr");
            doc.moveDown();
        }
        doc.moveDown();
    }

    doc.end();

    //Upload pdf to the database
    const connection = await mongoConnection();
    var bucket = new mongodb.GridFSBucket(connection); //Referred from https://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/
    fs.createReadStream('itinerary.pdf').
    pipe(bucket.openUploadStream(userID)).
    on('error', function(error) {
      assert.ifError(error);
    }).
    on('finish', function() {
      process.exit(0);
    });

    //Delete local PDF after storing in the database
    fs.unlink('itinerary.pdf',function(error){ //Referred from https://arjunphp.com/how-to-delete-a-file-in-node-js/
        if(error) {
            throw new Exception(error.message);
        }
    });

    return true;
}

module.exports = {
    generateItineraryPDF
}