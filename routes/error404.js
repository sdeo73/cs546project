const express = require('express');
const router = express.Router();

router.get('/error404', async (req, res) => {
    try 
    {
       res.status(200).render("pages/error404", {
            title: "error404"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

module.exports = router;