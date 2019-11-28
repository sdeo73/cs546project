
const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');
const forgotpassword = require('./forgotpassword');
const home=require('./home');
const contact=require('./contact');
const aboutus=require('./aboutus');
const error404 =require('./error404');
const terms= require('./terms');


const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/", signup);
    app.use("/", userPrefRoutes);
    app.use("/forgotpassword",forgotpassword);
    app.use("/",home);
    app.use("/",contact);
    app.use("/",aboutus);
    app.use("/",error404);
    app.use("/",terms);


    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

module.exports = constructorMethod;
