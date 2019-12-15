const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;
const errorMessages = require('../public/errorMessages');
const usersFunctions = data.users;
const xss = require('xss');

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
            let user = await usersFunctions.getUserById(req.session.userID);
            let userName = user.firstName + " " + user.lastName; 
            return res.status(200).render('pages/editPreferencesForm', { 
                title: "Change your preferences", 
                name: userName,
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
        res.status(404).render("pages/somethingWentWrong", {title: "Something Went Wrong"});
    }
});

router.post('/editpreferences', async (req, res) => {
    try {
        let oneSelected = false;

        if (req.session.userID) {
            if (await userPrefData.checkUserPreferenceExists(req.session.userID)) {
                const existingPref = await userPrefData.getUserPreferences(req.session.userID);
                if(req.body.city){
                    let city = xss(req.body.city, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateUserDestination(req.session.userID, city);
                    oneSelected = true;
                }
                if(req.body.mealPref){
                    let mealPref = xss(req.body.mealPref, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateUserMealPref(req.session.userID, mealPref);
                    oneSelected = true;
                }
                if(req.body.tourType){
                    let tourType = xss(req.body.tourType, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateUserTourType(req.session.userID, tourType);
                    oneSelected = true;
                }
                if(req.body.tourActivity){
                    let tourActivity = xss(req.body.tourActivity, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateUserTourActivity(req.session.userID, tourActivity);
                    oneSelected = true;
                }
                if(req.body.nTravelers){
                    let nTravelers = xss(req.body.nTravelers, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateNumOfTravelers(req.session.userID, nTravelers);
                    oneSelected = true;
                }
                let specialNeeds = false;
                if(req.body.specialNeeds){
                    let specialNeedsSanitized = xss(req.body.specialNeeds, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    if (specialNeedsSanitized == 'yes') {
                        specialNeeds = true;
                    } else {
                        specialNeeds = false;
                    }
                    await userPrefData.updateSpecialNeeds(req.session.userID, specialNeeds);
                    oneSelected = true;
                }
                if(req.body.budget){
                    let budget = xss(req.body.budget, {
                        whiteList: [], 
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: []
                    });
                    await userPrefData.updateBudget(req.session.userID, budget);
                    oneSelected = true;
                }

                if(req.body.travelDateStart && req.body.travelDateEnd){
                    if(req.body.travelDateEnd < req.body.travelDateStart) throw new Error(errorMessages.travelDatesInvalid);
                    if(req.body.travelDateEnd != existingPref.travelDates.end || req.body.travelDateStart != existingPref.travelDates.start){
                        let travelDateStart = xss(req.body.travelDateStart, {
                            whiteList: [], 
                            stripIgnoreTag: true,
                            stripIgnoreTagBody: []
                        });
                        let travelDateEnd = xss(req.body.travelDateEnd, {
                            whiteList: [], 
                            stripIgnoreTag: true,
                            stripIgnoreTagBody: []
                        });
                        await userPrefData.updateTravelDates(req.session.userID, travelDateStart, travelDateEnd);
                    }
                    oneSelected = true;
                }else if(req.body.travelDateStart){
                    throw new Error(errorMessages.editPrefNoEndDate);
                }else if(req.body.travelDateEnd){
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
        res.status(404).render("pages/somethingWentWrong", {title: "Something Went Wrong"});
    }
});

module.exports = router;