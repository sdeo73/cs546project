const express = require('express');
const router = express.Router();
const data = require('../data');
const signupData = data.signup;
const errorMessages = require('../public/errorMessages');

router.get('/', async (req, res) => {
    try {
        //res.status(200).render('');
    } catch (error) {
        res.sendStatus(404);
    }
});

router.post('/', async (req, res) => {
    try {
        const inputs = req.body;
        const inserted = await signupData.addUser(firstName = inputs.firstName, lastName = inputs.lastName, email = inputs.email, password = inputs.password, nationality = inputs.nationality);
        if(inserted == true){
            res.status(200).json({"inserted": true});
        }else{
            //res.status(400).render('', {hasErrors: true, errors: inserted});
            res.status(400).json({error: inserted});
        }
    } catch (error) {
        res.status(400).json({error:error.message});
    }
});

module.exports = router;