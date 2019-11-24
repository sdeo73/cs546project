const express = require('express');
const router = express.Router();
const data = require('../data');
const signupData = data.signup;
const errorMessages = require('../public/errorMessages');

router.get('/signup', async (req, res) => {
    try {
        res.status(200).render("pages/signup", {
            partial: "signup-scripts",
            title: "Sign up"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

router.post('/signup', async (req, res) => {  
    try {
        const inputs = req.body;
        if(!Array.isArray(inputs.nationality)){
            inputs.nationality = [inputs.nationality];
        }
        const inserted = await signupData.addUser(firstName = inputs.firstName, lastName = inputs.lastName, email = inputs.email, password = inputs.password, nationality = inputs.nationality);
        if(inserted == true){
            res.status(200).redirect("../login");
        }else{
            res.status(400).json({error: inserted});
        }
    } catch (error) {
        res.status(400).json({error:error.message});
    }
});

module.exports = router;