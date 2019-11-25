const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');
const passwordHash = require('password-hash');

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
            res.render('pages/forgotpassword', {title: "Forgot Password", hasErrors: hasErrors, error: req.session.invalidPass, partial: "login-scripts"});
        }
        return res.status(200);
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.post('/', async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const user_pass = req.body.user_password;
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
            if(await data.userPreferences.checkUserPreferenceExists(currentUser._id)) {
                return res.status(200).render('pages/loginSuccess', {title: "Successfully Login", user_email: user_email, user_pass: user_pass, partial: "undefined"});
            } else {
                return res.status(200).redirect('../preferences');
            }
        } else {
            req.session.invalidPass = "Invalid username or password was provided";
            //redirect to the login page again
            res.redirect('/');
            return res.status(401).json({error: validPass});
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
        req.session.destroy(res.render('pages/loginPage', {title: "Logout Successfully Page"}));
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = router;
