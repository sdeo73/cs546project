const express = require('express');
const router = express.Router();
const data = require('../data');
const signupData = data.signup;
const errorMessages = require('../public/errorMessages');
var xss = require("xss");

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
        const firstName = xss(req.body.firstName, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const lastName = xss(req.body.lastName, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const email = xss(req.body.email, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const password = xss(req.body.password, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const nationality = xss(req.body.nationality, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        let nationalities = [];
        // const inputs = req.body;
        if(!Array.isArray(nationality)){
            nationalities = [nationality];
        }
        const inserted = await signupData.addUser(firstName, lastName, email, password, nationalities);
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