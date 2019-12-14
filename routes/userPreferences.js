const express = require('express');
const router = express.Router();
const data = require('../data');
const userPrefData = data.userPreferences;
const xss = require("xss");

router.get('/preferences', async (req, res) => {
    try {
        if (await data.userPreferences.checkUserPreferenceExists(req.session.userID)) {
            res.status(200).redirect('/viewItinerary');
        } else {
            res.status(200).render('pages/userPreferencesForm', { title: "Tell Us What You Like", partial: "preferences-scripts" });
        }
    } catch (e) {
        res.status(404).render("pages/somethingWentWrong",  {title: "Something Went Wrong"});
    }
})

router.post('/preferences', async (req, res) => {
    try {
        const gender = xss(req.body.gender, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const dob = xss(req.body.dob, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const mealPref = xss(req.body.mealPref, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const tourType = xss(req.body.tourType, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const tourActivity = xss(req.body.tourActivity, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const nTravelers = xss(req.body.nTravelers, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        let specialNeeds = xss(req.body.specialNeeds, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const budget = xss(req.body.budget, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const city = xss(req.body.city, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const travelDateStart = xss(req.body.travelDateStart, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const travelDateEnd = xss(req.body.travelDateEnd, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });

        if (specialNeeds == 'yes') {
            specialNeeds = true;
        } else {
            specialNeeds = false;
        }
        const userPref = await userPrefData.addUserPreferences(gender, dob, mealPref, tourType, tourActivity,
                nTravelers, specialNeeds, budget, city, travelDateStart, travelDateEnd, req.session.userID);
        
        if (!userPref) {
            return res.status(400).json({ error: userPref });
        } else {
            return res.status(200).redirect('/generateItinerary');
        }
    } catch (e) {
        res.status(404).render("pages/somethingWentWrong",  {title: "Something Went Wrong"});
    }
})

module.exports = router;