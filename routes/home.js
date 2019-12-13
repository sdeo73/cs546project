const express = require('express');
const router = express.Router();

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
        res.status(200).render("pages/userHome", {
            title: "Home"
        });
    } catch (error) {
        res.status(404).render("pages/error404");
    }
});

module.exports = router;