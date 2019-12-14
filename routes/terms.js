const express = require('express');
const router = express.Router();
const data = require('../data');
const usersFunctions = data.users;

router.get('/terms', async (req, res) => {
    try {
        if (!req.session.userID) {
            res.status(200).render("pages/termsLoggedOut", {
                title: "Terms and Conditions"
            });
        } else {
            let user = await usersFunctions.getUserById(req.session.userID);
            let userName = user.firstName + " " + user.lastName; 
            res.status(200).render("pages/terms", {
                title: "Terms and Conditions",
                name: userName
            });
        }
    } catch (error) {
        res.status(404).render("pages/error404", {title: "404 Not Found"});
    }
});

module.exports = router;