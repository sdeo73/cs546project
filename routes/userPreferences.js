const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;

router.get('/preferences', async (req, res) => {
    try {
        if (await data.userPreferences.checkUserPreferenceExists(req.session.userID)) {
            res.status(200).redirect('/home');
        } else {
            res.status(200).render('pages/userPreferencesForm', { title: "Tell Us What You Like", partial: "preferences-scripts" });
        }
    } catch (e) {
        return res.status(404).json({ error: e.message });
    }
})

router.post('/preferences', async (req, res) => {
    try {
        let userPrefInput = req.body;
        let specialNeeds;
        if (!userPrefInput.specialNeeds) {
            specialNeeds = [];
        } else {
            specialNeeds = userPrefInput.specialNeeds;
        }
        const userPref = await userPrefData.addUserPreferences(userPrefInput.gender, userPrefInput.dob, userPrefInput.mealPref, userPrefInput.tourType, userPrefInput.tourActivity, userPrefInput.nTravelers, specialNeeds, userPrefInput.budget, userPrefInput.city, userPrefInput.travelDateStart, userPrefInput.travelDateEnd, req.session.userID);
        if (!userPref) {
            return res.status(400).json({ error: userPref });
        } else {
<<<<<<< HEAD
            req.session.userPreferences = userPrefInput;
            return res.status(200).redirect('/viewItinerary');
=======
            res.status(200).redirect('/home');
>>>>>>> 1d956b14817f56eaa1687dab0ee606603d7f01b4
        }
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
})

module.exports = router;