const express = require('express');
const router = express.Router();
const data = require('../data');
const usersFunctions = data.users;

router.get('/aboutus', async (req, res) => {
    try {
        if (!req.session.userID) {
            res.status(200).render("pages/aboutusLoggedOut", {
                title: "About Us"
            });
        } else {
            let user = await usersFunctions.getUserById(req.session.userID);
            let userName = user.firstName + " " + user.lastName; 
            res.status(200).render("pages/aboutus", {
                title: "About Us",
                name: userName
            });
        }
    } catch (error) {
        res.status(404).render("pages/error404", {title: "404 Not Found"});
    }
});

module.exports = router;