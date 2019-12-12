const express = require('express');
const router = express.Router();

router.get('/explore', async (req, res) => {
    try 
    {
       res.status(200).render("pages/explore", {
            title: "explore"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;