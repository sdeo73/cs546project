const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');
const passwordHash = require('password-hash');
const bcrypt = require("bcrypt");

router.get('/', async (req, res) => {
    try {

        if (req.session.AuthCookie) { //AuthCookie exists
            //gets the user info from user collection with sessionID
            
            //redirect to home page?

        } else {
            let hasErrors = false;
            if (req.session.invalidPass) {
                hasErrors = true;
            }
            res.render('posts/loginPage', {title: "Login Page", hasErrors: hasErrors, error: req.session.invalidPass});
        }
        return res.status(200);
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        let errors = [];
        const user_email = req.body.user_email;
        const user_pass = req.body.user_password;
        console.log(`email = ${user_email}`);
        console.log(`password = ${user_pass}`);
        const currentUser = await loginData.getHashPassword(user_email);

        let validPass = false;
        if (currentUser !== null) { //user exists
            const hashPass = currentUser.password;
            console.log(`hashPass = ${hashPass}`);
            validPass = passwordHash.verify(user_pass, hashPass);
        }
        if (validPass) {
            //sets the AuthCookie value to session id
            req.session.AuthCookie = req.sessionID;
            req.session.userID = currentUser._id;
            //inserts the session id to user collection
            loginData.insertSessionID(currentUser._id, req.sessionID);

            //redirect to home page
            res.render('posts/loginSuccess', {title: "Successfully Login", user_email: user_email, user_pass: user_pass});
            return res.status(200);
        } else {
            req.session.invalidPass = "Invalid username or password was provided";
            //redirect to the login page again
            res.redirect('/');
            return res.status(401).json({error: validPass});
        }
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.get('/logout', async (req, res) => {
    try {
        //removes the session id from the user collection
        await loginData.removeSessionID(req.session.userID, req.session.AuthCookie);
        //Expire the cookies and render the logoutPage
        req.session.destroy(res.render('posts/loginPage', {title: "Logout Successfully Page"}));
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = router;
