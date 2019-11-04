const loginRoutes = require('./login');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("*", (req, res) => {
      res.status(404).json({error: 'Not found'});
    });
};
  
module.exports = constructorMethod;