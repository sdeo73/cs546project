const express = require('express');

const router = express.Router();

router.get('/contact', async (req, res) => {
    try {
        if (!req.session.userID) {
            res.status(200).render("pages/contactLoggedOut", {
                title: "Contact Us"
            });
        } else {
            res.status(200).render("pages/contact", {
                title: "Contact Us"
            });
        }
    }

    catch (error) {
        res.status(404).render("pages/error404");
    }
});

module.exports = router;