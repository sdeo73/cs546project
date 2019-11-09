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
            res.render('posts/loginPage', {tab_title: "Login Page"});
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
            //inserts the session id to user collection
            loginData.insertSessionID(currentUser._id, req.sessionID);

            //redirect to home page
            res.render('posts/loginSuccess', {tab_title: "Successfully Login", user_email: user_email, user_pass: user_pass});
            return res.status(200);
        } else {
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
        //Expire the cookies and render the logoutPage
        req.session.destroy(res.render('pages/logoutPage', {tab_title: "Logout Successfully Page"}));
        //removes the session id from the user collection
        // loginData.removeSessionID(req)
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = router;
