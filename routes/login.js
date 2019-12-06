const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const passwordHash = require('password-hash');
var xss = require("xss");

// Render the login page when user hits /login.
// If session contains user ID, redirect user to loginSuccess page, else render the login page.

router.get('/login', async (req, res) => {
    try {
        if (req.session.userID) {
           res.status(200).redirect('/home');
        } else {
            return res.render('pages/loginPage',{ title: "Login", partial: "login-scripts" });
        }
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.get('/home', async(req,res) => {
    try {
        return res.status(200).render('pages/loginSuccess', { title: "Successfully Login", partial: "undefined" });
    } catch (error) {
        return res.status(404).json(error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user_email = xss(req.body.user_email, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const user_pass = xss(req.body.user_password, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const currentUser = await loginData.getHashPassword(user_email);

        let validPass = false;
        if (currentUser !== null) { //user exists
            const hashPass = currentUser.password;
            validPass = passwordHash.verify(user_pass, hashPass);
        }
        if (validPass) {
            //sets the AuthCookie value to session id
            req.session.AuthCookie = req.sessionID;
            req.session.userID = currentUser._id;
            //inserts the session id to user collection
            loginData.insertSessionID(currentUser._id, req.sessionID);

            //redirect to home page
            if (await data.userPreferences.checkUserPreferenceExists(currentUser._id)) {
                res.status(200).redirect('/home');
            } else {
                return res.status(200).redirect('../preferences');
            }
        } else {
            //redirect to the login page again
            return res.status(401).render('pages/loginPage', { title: "Login", invalidPasswordError: "Invalid username or password!", partial: "login-scripts" });
        }
    } catch (error) {
        return res.status(404).json(error.message);
    }
});

router.get('/logout', async (req, res) => {
    try {
        //removes the session id from the user collection
        await loginData.removeSessionID(req.session.userID, req.session.AuthCookie);
        //Expire the cookies and render the logoutPage
        req.session.destroy(res.render('pages/loginPage', { title: "Logout Successfully Page" }));
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = router;
