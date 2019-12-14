const express = require('express');
const router = express.Router();
const data = require('../data');
const usersFunctions = data.users;

router.get('/home', async (req, res) => {
    try {
        res.status(200).render("pages/home", {
            title: "Home"
        });
    } catch (error) {
        res.status(404).render("pages/error404");
    }
});

router.get('/userHome', async (req, res) => {
    try {
        let user = await usersFunctions.getUserById(req.session.userID);
        let userName = user.firstName + " " + user.lastName; 
        res.status(200).render("pages/userHome", {
            title: "Home",
            name: userName
        });
    } catch (error) {
        res.status(404).render("pages/error404");
    }
});

module.exports = router;