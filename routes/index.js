const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');
const itineraryRoutes = require('./itinerary');
const home=require('./home');
const contact=require('./contact');
const aboutus=require('./aboutus');
const terms= require('./terms');
const editPrefRoutes = require('./editPreferences');
const editProfileRoutes = require('./editProfile');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/", signup);
    app.use("/", userPrefRoutes);
    app.use("/", itineraryRoutes);
    app.use("/",home);
    app.use("/",contact);
    app.use("/",aboutus);
    app.use("/",terms);
    app.use("/", editPrefRoutes);
    app.use("/", itineraryRoutes);
    app.use("/", editProfileRoutes);
  
    app.use("*", (req, res) => {
      res.status(404).render("pages/error404");
    });
};

module.exports = constructorMethod;
