const express = require('express');
const router = express.Router();
const data = require('../data');
const loginData = data.login;
const errorMessages = require('../public/errorMessages');

router.get('/', async (req, res) => {
    try {
        // res.render('mainPage', {tab_title: "Main Page"});
        res.render('posts/loginPage', {tab_title: "Login Page"});
        return res.status(200);
    } catch (error) {
        return res.status(404).json(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        console.log("Enter login routes");
        const user_email = req.body.user_email;
        const user_pass = req.body.user_password;
        console.log(`email = ${user_email}`);
        console.log(`password = ${user_pass}`);
        // const user_email = req.params.email;
        // const user_pass = req.params.pass;
        const loginInfo = await loginData.loginValidation(user_email, user_pass);
        
        if(loginInfo == true){
            res.render('posts/loginSuccess', {tab_title: "Successfully Login", user_email: user_email, user_pass: user_pass});
            return res.status(200).json({loginSuccess: "Login successfully"});
        }else{
            return res.status(400).json({error: loginInfo});
        }
        
        // return res.status(200);
    } catch (error) {
        return res.status(404).json(error);
    }
});

module.exports = router;
