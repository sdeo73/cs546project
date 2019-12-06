const express = require('express');
const router = express.Router();

router.get('/userhome', async (req, res) => {
    try {
        res.status(200).render("pages/home", {
            title: "Home"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;