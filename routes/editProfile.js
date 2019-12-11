const express = require('express');
const router = express.Router();
const data = require('../data');
const signupData = data.signup;
const errorMessages = require('../public/errorMessages');
const xss = require("xss");
const userData = data.users;

router.use('/editprofile', function (req, res, next) {
    if (req.session.userID) {
      return next();
    } else {
      return res.status(200).redirect('/login');
    }
});

router.get('/editprofile', async (req, res) => {
    try {
        res.status(200).render("pages/editProfile", {
            partial: "edit-profile-scripts",
            title: "Edit Profile"
        });
    } catch (error) {
        console.log("not found");
        res.sendStatus(404);
    }
});

router.post('/editprofile', async (req, res) => {
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
        const nationality = xss(req.body.nationality, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        if (email && email.length > 0 && await signupData.checkIfEmailTaken(email)) {
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            return res.end(JSON.stringify({message: "emailExists"}));
        } else {
            let nationalities = [];
            if(!Array.isArray(nationality)){
                nationalities = [nationality];
            }
    
            if(firstName && firstName.length > 0){
                await userData.updateFirstName(req.session.userID, firstName);
            }
            if(lastName && lastName.length > 0){
                await userData.updateLastName(req.session.userID, lastName);
            }
            if(email && email.length > 0){
                await userData.updateEmail(req.session.userID, email);
            }
            if(nationality && nationality.length > 0){
                await userData.updateNationality(req.session.userID, nationality);
            }
            const updatedUser = await userData.getUserById(req.session.userID);
            const newName = updatedUser.firstName + " " + updatedUser.lastName;
            res.writeHead(200, { 'Content-Type': 'application/json' }); 
            return res.end(JSON.stringify({message: newName}));
        }
    } catch (error) {
        res.writeHead(200, { 'Content-Type': 'application/json' }); 
        return res.end(JSON.stringify({message: "serverError"}));
    }
});

module.exports = router;