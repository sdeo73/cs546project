const express = require('express');
const router = express.Router();
const data = require('../data');
const itineraryFunctions = data.itinerary;
const displayItineraryFunctions = data.displayItinerary;
const mongoCollections = require("./../config/mongoCollections");
const destination = mongoCollections.destinations;
const userPrefFunctions = data.userPreferences;
const mongoConnection = require("./../config/mongoConnection");
const usersFunctions = data.users;

router.get('/generateItinerary', async (req, res) => {
    try {
        const destinationCollection = await destination();
        let userID = req.session.userID;
        //let userPrefExists = await userPrefFunctions.checkUserPreferenceExists(userID);
        let userPref = await userPrefFunctions.getUserPreferences(userID);
        if (userPref == null || userPref == undefined) {
            return res.status(200).redirect('../preferences');
        } else {
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
            let timeDifference = new Date(userPref.travelDates.end).getTime() - new Date(userPref.travelDates.start).getTime();
            let numberOfDays = (timeDifference / (1000 * 3600 * 24)) + 1;

            //Get destination ID 
            let destinationID = (await destinationCollection.findOne({ 'd_name': userPref.destination }))._id.toString();

            //Create user preference object for the generateCompleteItinerary() function
            let userPreferences = {
                mealPreference: userPref.mealPreference,
                destinationId: destinationID,
                tourType: userPref.tourType,
                hoursPerDay: numOfHrs,
                maxBudgetPerPerson: userPref.budget,
                numOfDays: numberOfDays,
                numOfTravelers: userPref.noOfTravelers,
                specialNeeds: userPref.specialNeeds,
            }

            const connection = await mongoConnection();

            const result = await itineraryFunctions.generateCompleteItinerary(userPreferences);
            const totalSpent = await itineraryFunctions.getTotalExpense();
            let done = await displayItineraryFunctions.generateItineraryPDF(result, userID, userPref.travelDates, userPref.destination, userPref.tourType, totalSpent, connection);
            if (done) {
                let user = await usersFunctions.getUserById(req.session.userID);
                let userName = user.firstName + " " + user.lastName;
                return res.status(200).render("pages/viewItinerary", { title: "Your Itinerary", partial: "undefined", name: userName });
            }
        }
    } catch (error) {
        res.status(404).render("pages/somethingWentWrong", {title: "Something Went Wrong"});
    }
});

router.get('/viewItinerary', async (req, res) => {
    try {
        let userID = req.session.userID;
        const connection = await mongoConnection();
        let done = await data.displayItinerary.fetchUserItinerary(userID, connection);
        if (done) {
            let user = await usersFunctions.getUserById(req.session.userID);
            let userName = user.firstName + " " + user.lastName;
            return res.status(200).render("pages/viewItinerary", { title: "Your Itinerary", partial: "undefined", name: userName });
        } else {
            let user = await usersFunctions.getUserById(req.session.userID);
            let userName = user.firstName + " " + user.lastName;
            return res.status(404).render("pages/noItinerary", { title: "Your Itinerary", partial:"no-itinerary-scripts", name: userName });
        }
    } catch (error) {
        res.status(404).render("pages/somethingWentWrong",  {title: "Something Went Wrong"});
    }
});

module.exports = router;