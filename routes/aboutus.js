const express = require('express');
const router = express.Router();

router.get('/aboutus', async (req, res) => {
    try {
        res.status(200).render("pages/aboutus", {
            title: "About Us"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;