const express = require('express');
const router = express.Router();

router.get('/terms', async (req, res) => {
    try {
        res.status(200).render("pages/terms", {
            title: "Terms and Conditions"
        });
    } catch (error) {
        res.status(404).render("pages/somethingWentWrong");
    }
});

module.exports = router;