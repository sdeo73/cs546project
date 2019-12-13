const express = require('express');
const router = express.Router();

router.get('/aboutus', async (req, res) => {
    try {
        if (!req.session.userID) {
            res.status(200).render("pages/aboutusLoggedOut", {
                title: "About Us"
            });
        } else {
            res.status(200).render("pages/aboutus", {
                title: "About Us"
            });
        }
    } catch (error) {
        res.status(404).render("pages/error404");
    }
});

module.exports = router;