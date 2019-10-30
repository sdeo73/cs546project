const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');

router.get('/', async (req, res) => {
    try {
        //res.status(200).render('');
    } catch (error) {
        res.sendStatus(404);
    }
});
