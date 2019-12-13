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
        res.status(404).render("pages/somethingWentWrong");
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
        if (email && email.length > 0) {
            if(await signupData.checkIfEmailTaken(email)){
                let user = await userData.getUserById(req.session.userID);
                if(user.email != email){
                    res.writeHead(401, { 'Content-Type': 'application/json' }); 
                    return res.end(JSON.stringify({message: "emailExists"}));
                }
            } 
        } 
        let nationalities = nationality.split(',');

        if(firstName && firstName.length > 0){
            await userData.updateFirstName(req.session.userID, firstName);
        }
        if(lastName && lastName.length > 0){
            await userData.updateLastName(req.session.userID, lastName);
        }
        if(email && email.length > 0){
            await userData.updateEmail(req.session.userID, email);
        }
        if(nationalities && nationalities.length > 0){
            let nationalitiesNoNull = [];
            for(let i=0; i<nationalities.length; i++){
                if(nationalities[i] != ""){
                    nationalitiesNoNull.push(nationalities[i]);
                }
            }
            if(nationalitiesNoNull.length > 0){
                let nationalitiesSetSize = (new Set(nationalitiesNoNull)).size;
                if(nationalitiesSetSize != nationalitiesNoNull.length){
                    res.writeHead(401, { 'Content-Type': 'application/json' }); 
                    return res.end(JSON.stringify({message: "duplicateNationalities"}));
                }else{
                    await userData.updateNationality(req.session.userID, nationalitiesNoNull);
                }
            }  
        }
        const updatedUser = await userData.getUserById(req.session.userID);
        const newName = updatedUser.firstName + " " + updatedUser.lastName;
        res.writeHead(200, { 'Content-Type': 'application/json' }); 
        return res.end(JSON.stringify({message: newName}));
        
    } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' }); 
        return res.end(JSON.stringify({message: "serverError"}));
    }
});

module.exports = router;