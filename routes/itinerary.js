const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/viewItinerary', async (req,res) => {
    try {
        const result = await data.knapsack.generateCompleteItinerary("5ddd7096f1be540e21479ae6",8,1000,2,5);
        let done = await data.itinerary.generateItineraryPDF(result, "5ddd611208f5180b82f1186d");
        if(done) {
            return res.status(200).render("pages/viewItinerary", {partial: "undefined"});
        }
    } catch (error) {
        return res.status(404).json({error: error.message});
    }
})

module.exports = router;