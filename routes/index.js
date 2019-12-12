const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');
const forgotpassword = require('./forgotpassword');
const itineraryRoutes = require('./itinerary');
const home=require('./home');
const contact=require('./contact');
const aboutus=require('./aboutus');
const error404 =require('./error404');
const terms= require('./terms');
const explore= require('./explore');
const editPrefRoutes = require('./editPreferences');
const itineraryRoutes = require('./itinerary');
const editProfileRoutes = require('./editProfile');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/", signup);
    app.use("/", userPrefRoutes);
    app.use("/",forgotpassword);
    app.use("/", itineraryRoutes);
    app.use("/",home);
    app.use("/",contact);
    app.use("/",aboutus);
    app.use("/",error404);
    app.use("/",terms);
    app.use("/",explore);
    app.use("/", editPrefRoutes);
    app.use("/", itineraryRoutes);
    app.use("/", editProfileRoutes);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

module.exports = constructorMethod;
