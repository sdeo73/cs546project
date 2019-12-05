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
        let userPref = req.session.userPreferences;
        let mealPreference = req.session.userPreferences.mealPref;

        //Convert to array if only one selection is present
        if(!Array.isArray(mealPreference)) {
            mealPreference = mealPreference.split(" ");
        }
        let numOfHrs;
        //Set number of hours based on tour type
        if (userPref.tourActivity == 'relaxed') {
            numOfHrs = 8;
        } else if (userPref.tourActivity == 'moderate') {
            numOfHrs = 10;
        } else if (userPref.tourActivity == 'high') {
            numOfHrs = 14;
        }
        //Calculate number of days of travel
        let timeDifference = new Date(userPref.travelDateEnd).getTime() - new Date(userPref.travelDateStart).getTime();
        let numberOfDays = timeDifference / (1000 * 3600 * 24);

        //Get destination ID 
        let destinationID = (await destinationCollection.findOne({ 'd_name': userPref.city }))._id.toString();

        //Create user preference object for the generateCompleteItinerary() function
        let userPreferences = {
            mealPreference: {
                vegan: mealPreference.includes("vegan"),
                vegetarian: mealPreference.includes("vegetarian"),
                whiteMeat: mealPreference.includes("whiteMeat"),
                redMeat: mealPreference.includes("redMeat"),
                seafood: mealPreference.includes("seafood"),
                eggs: mealPreference.includes("eggs")
            },
            destinationId: destinationID,
            tourType: userPref.tourType,
            hoursPerDay: numOfHrs,
            maxBudgetPerPerson: userPref.budget,
            numOfDays: numberOfDays,
            numOfTravelers: userPref.nTravelers,
            specialNeeds: userPref.specialNeeds,
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
        let done = await data.displayItinerary.fetchUserItinerary(userID, connection);
        if (done) {
            return res.status(200).render("pages/viewItinerary", { title: "Your Itinerary", partial: "undefined" });
        }
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
});

module.exports = router;