const express = require('express');
const router = express.Router();

router.get('/contact', async (req, res) => {
    try {
        res.status(200).render("pages/contact", {
            title: "Contact Us"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;