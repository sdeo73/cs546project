const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;
const errorMessages = require('../public/errorMessages');

router.use('/editpreferences', function (req, res, next) {
    if (req.session.userID) {
      return next();
    } else {
      return res.status(200).redirect('/login');
    }
});

router.get('/editpreferences', async (req, res) => {
    try {
        if (await userPrefData.checkUserPreferenceExists(req.session.userID)) {

            // Handlebars helper code reused from https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
            let userPreferences = await userPrefData.getUserPreferences(req.session.userID);
            return res.status(200).render('pages/editPreferencesForm', { 
                title: "Change your preferences", 
                partial: "edit-preferences-scripts" , userPreferences: userPreferences,
                helpers: {
                    'ifEquals': function(arg1, arg2, options) {
                        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
                    }
                }
            });
        } else {
            return res.status(200).redirect('/preferences');
        }
    } catch (e) {
        res.status(404).render("pages/somethingWentWrong");
    }
});

router.post('/editpreferences', async (req, res) => {
    try {
        let editPrefInput = req.body;
        let oneSelected = false;

        if (req.session.userID) {
            if (await userPrefData.checkUserPreferenceExists(req.session.userID)) {
                const existingPref = await userPrefData.getUserPreferences(req.session.userID);
                if(editPrefInput.city){
                    await userPrefData.updateUserDestination(req.session.userID, editPrefInput.city);
                    oneSelected = true;
                }
                if(editPrefInput.mealPref){
                    await userPrefData.updateUserMealPref(req.session.userID, editPrefInput.mealPref);
                    oneSelected = true;
                }
                if(editPrefInput.tourType){
                    await userPrefData.updateUserTourType(req.session.userID, editPrefInput.tourType);
                    oneSelected = true;
                }
                if(editPrefInput.tourActivity){
                    await userPrefData.updateUserTourActivity(req.session.userID, editPrefInput.tourActivity);
                    oneSelected = true;
                }
                if(editPrefInput.nTravelers){
                    await userPrefData.updateNumOfTravelers(req.session.userID, editPrefInput.nTravelers);
                    oneSelected = true;
                }
                let specialNeeds = false;
                if(editPrefInput.specialNeeds){
                    if (editPrefInput.specialNeeds == 'yes') {
                        specialNeeds = true;
                    } else {
                        specialNeeds = false;
                    }
                    await userPrefData.updateSpecialNeeds(req.session.userID, specialNeeds);
                    oneSelected = true;
                }
                if(editPrefInput.budget){
                    await userPrefData.updateBudget(req.session.userID, editPrefInput.budget);
                    oneSelected = true;
                }

                if(editPrefInput.travelDateStart && editPrefInput.travelDateEnd){
                    if(editPrefInput.travelDateEnd < editPrefInput.travelDateStart) throw new Error(errorMessages.travelDatesInvalid);
                    if(editPrefInput.travelDateEnd != existingPref.travelDates.end && editPrefInput.travelDateStart != existingPref.travelDates.start){
                        await userPrefData.updateTravelDates(req.session.userID, editPrefInput.travelDateStart, editPrefInput.travelDateEnd);
                    }
                    oneSelected = true;
                }else if(editPrefInput.travelDateStart){
                    throw new Error(errorMessages.editPrefNoEndDate);
                }else if(editPrefInput.travelDateEnd){
                    throw new Error(errorMessages.editPrefNoStartDate);
                }

            } else {
                return res.status(200).redirect('/preferences');
            }
        } else {
            return res.status(200).redirect('/login');
        }

        if(!oneSelected){
            throw new Error(errorMessages.editPrefNoPref);
        }else{
            return res.status(200).redirect('/generateItinerary');
        }
    } catch (error) {
        res.status(404).render("pages/somethingWentWrong");
    }
});

module.exports = router;