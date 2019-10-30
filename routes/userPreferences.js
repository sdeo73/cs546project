const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;

router.post('/', async(req,res) => {
    try {
        let userPrefInput = req.body;
        const userPref = await userPrefData.addUserPreferences(userPrefInput.gender,userPrefInput.dob, userPrefInput.userID,userPrefInput.mealPreference,userPrefInput.tourType,userPrefInput.noOfTravelers, userPrefInput.specialNeeds, userPrefInput.budget,userPrefInput.destination, userPrefInput.travelDates);
        if(userPref!==true) {
            return res.status(400).json({error: userPref});
            //return res.status(400).render('', {hasErrors: true, errors: userPref});
        } else {
            return res.status(200).json({inserted: true});
        }
    } catch (e) {
        return res.status(404).json({error: e});
    }
})

module.exports = router;