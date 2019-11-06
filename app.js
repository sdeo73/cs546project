const express = require('express');
const app = express();
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const static = express.static(__dirname + '/public');

app.use('/public', static);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("Server now listening on port 3000...");
});
