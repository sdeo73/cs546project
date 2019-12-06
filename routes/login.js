const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');
const passwordHash = require('password-hash');
const timeLimit = 2;
const numberOfAttempts = 3;

// Render the login page when user hits /login.
// If session contains user ID, redirect user to loginSuccess page, else render the login page.

router.get('/login', async (req, res) => {
    try {
        if (req.session.userID) {
            res.status(200).redirect('/home');
        } else {
            return res.render('pages/loginPage', { title: "Login", partial: "login-scripts" });
        }
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.get('/home', async (req, res) => {
    try {
        return res.status(200).render('pages/loginSuccess', { title: "Successfully Login", partial: "undefined" });
    } catch (error) {
        return res.status(404).json(error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const user_pass = req.body.user_password;
        const currentUser = await loginData.getHashPassword(user_email);
        let validPass = false;

        //Get number of failed attempts and latest timestamp from the database 
        let failedAttempts = await data.users.getFailedAttempts(user_email);
        let timeStamp = await data.users.getTimeStamp(user_email);

        //If time the user has been locked out is less than the time limit, do not allow the user to login
        //If time the user has been locked out is >= time limit, allow user to login and reset number of failed attempts
        if (timeStamp != -1 && (Date.now() - timeStamp) / (1000 * 60) < timeLimit && failedAttempts > numberOfAttempts) {
            return res.status(401).render('pages/loginPage', { title: "Login", invalidPasswordError: "Too many incorrect attempts. Try again later.", partial: "login-scripts" });
        } else if (timeStamp != -1 && (Date.now() - timeStamp) / (1000 * 60) >=timeLimit && failedAttempts > numberOfAttempts) {
            await data.users.resetFailedAttempts(user_email);
            if (currentUser !== null) {
                const hashPass = currentUser.password;
                validPass = passwordHash.verify(user_pass, hashPass);
            }
            if (!validPass) {
                await data.users.updateFailedAttempts(user_email);
                return res.status(401).render('pages/loginPage', { title: "Login", invalidPasswordError: "Invalid username or password!", partial: "login-scripts" });
            }
        }

        //If the above conditions do not pass, check if password is valid
        if (currentUser !== null) {
            const hashPass = currentUser.password;
            validPass = passwordHash.verify(user_pass, hashPass);
        }

        if (validPass) {
            //Reset number of failed attempts if login is successful
            await data.users.resetFailedAttempts(user_email);
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
            //Check if user has exceeded number of login attempts
            failedAttempts = (await data.users.updateFailedAttempts(user_email));
            if (failedAttempts!=false && failedAttempts > numberOfAttempts) {
                await data.users.updateTimeStamp(user_email);
                return res.status(401).render('pages/loginPage', { title: "Login", invalidPasswordError: "Too many incorrect attempts. Try again later.", partial: "login-scripts" });
            } else {
                return res.status(401).render('pages/loginPage', { title: "Login", invalidPasswordError: "Invalid username or password!", partial: "login-scripts" });
            }
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
