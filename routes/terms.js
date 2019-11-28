const express = require('express');
const router = express.Router();

router.get('/terms', async (req, res) => {
    try {
        res.status(200).render("pages/terms", {
            title: "error404"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;