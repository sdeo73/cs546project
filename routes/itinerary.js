const express = require('express');
const router = express.Router();
const data = require('../data');
const mongoCollections = require("./../config/mongoCollections");
const destination = mongoCollections.destinations;
const mongoConnection = require("./../config/mongoConnection");

router.get('/generateItinerary', async (req, res) => {
    try {
        const destinationCollection = await destination();
        let userID = req.session.userID;
        let numOfHrs;
        //Set number of hours based on tour type
        if (req.session.userPreferences.tourActivity == 'relaxed') {
            numOfHrs = 8;
        } else if (req.session.userPreferences.tourActivity == 'moderate') {
            numOfHrs = 10;
        } else if (req.session.userPreferences.tourActivity == 'high') {
            numOfHrs = 14;
        }
        //Calculate number of days of travel
        let timeDifference = new Date(req.session.userPreferences.travelDateEnd).getTime() - new Date(req.session.userPreferences.travelDateStart).getTime();
        let numberOfDays = timeDifference / (1000 * 3600 * 24);

        //Get destination ID 
        let destinationID = (await destinationCollection.findOne({ 'd_name': req.session.userPreferences.city}))._id.toString();

        //Create user preference object for the generateCompleteItinerary() function
        let userPreferences = {
            destinationId: destinationID,
            tourType: req.session.userPreferences.tourType,
            hoursPerDay: numOfHrs,
            maxBudgetPerPerson: req.session.userPreferences.budget,
            numOfDays: numberOfDays,
            numOfTravelers: req.session.userPreferences.noOfTravelers
        }

        const connection = await mongoConnection();
        const result = await data.itinerary.generateCompleteItinerary(userPreferences);
        let done = await data.displayItinerary.generateItineraryPDF(result, userID, connection);
        if (done) {
            return res.status(200).render("pages/viewItinerary", { title: "Your Itinerary", partial: "undefined" });
        }
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
});

router.get('/viewItinerary', async (req, res) => {
    try {
        let userID = req.session.userID;
        const connection = await mongoConnection();
       let done = await data.displayItinerary.fetchUserItinerary(userID,connection);
       if(done) {
        return res.status(200).render("pages/viewItinerary", { title: "Your Itinerary", partial: "undefined" });
       }
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
});

module.exports = router;