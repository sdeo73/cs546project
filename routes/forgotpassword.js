const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');
const passwordHash = require('password-hash');

router.get('/forgotpassword', async (req, res) => {
    try {
        res.render('pages/forgotpassword', { title: "Forgot Password", partial: "undefined"});
        return res.status(200);
    } catch (error) {
        return res.status(404).json(error);
    }
});

module.exports = router;
