const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;

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
            return res.status(200).render('pages/editPreferencesForm', { title: "Change your preferences", partial: "edit-preferences-scripts" });
        } else {
            return res.status(200).redirect('preferences');
        }
    } catch (e) {
        return res.status(404).json({ error: e.message });
    }
});

router.post('/editpreferences', async (req, res) => {
    try {
        let editPrefInput = req.body;
        let oneSelected = false;

        if (req.session.userID) {
            if (await userPrefData.checkUserPreferenceExists(req.session.userID)) {
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
                if(editPrefInput.specialNeeds){
                    await userPrefData.updateSpecialNeeds(req.session.userID, editPrefInput.specialNeeds);
                    oneSelected = true;
                }
                if(editPrefInput.budget){
                    await userPrefData.updateBudget(req.session.userID, editPrefInput.budget);
                    oneSelected = true;
                }

                if(editPrefInput.travelDateStart && editPrefInput.travelDateEnd){
                    await userPrefData.updateTravelDates(req.session.userID, editPrefInput.travelDateStart, editPrefInput.travelDateEnd);
                    oneSelected = true;
                }else if(editPrefInput.travelDateStart){
                    throw new Error("Please specify an end date!");
                }else if(editPrefInput.travelDateEnd){
                    throw new Error("Please sprcify a start date!");
                }

            } else {
                return res.status(200).redirect('preferences');
            }
        } else {
            return res.status(200).redirect('/login');
        }

        if(!oneSelected){
            throw new Error("No preference selected to change!");
        }else{
            return res.status(200).redirect('/home');
        }
    } catch (error) {
        return res.status(404).json({ error: e.message });
    }
});

module.exports = router;