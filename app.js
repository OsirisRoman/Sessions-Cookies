const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorControler = require('./controllers/error');

const mongoose = require('mongoose');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${encodeURIComponent(
  'Osiris'
)}:${encodeURIComponent(
  '1724771645'
)}@cluster0.7jlvx.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

//session is used as a middleware because it is used
//on every user request.
//"secret": parameter is the encryption phrase
//"resave": tells the server to save the session to
//the session store, even if the session was never
//modified during the request, in this case false
//means that the session will be saved just when it
//became modified.
//"saveUninitialized": Forces a session that is
//"uninitialized" to be saved to the store. A session
//is uninitialized when it is new but not modified.
//Choosing false is useful for implementing login
//sessions, reducing server storage usage, or complying
//with laws that require permission before setting a cookie
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);

//Before initializing the project, comment the
//following section and run the server. This will
// make the server to create a user for the first time.
//If case you want to specify your own user parameters
//you could modify these on lines 67 and 68 of this file.
//After that stop the server and assign the user ID
//to the constant userID variable to make te server
//run without problems. Finally restart the server
//and from now on it will run ok.
/////////////////////////////////////////////////
app.use((req, res, next) => {
  const userID = '604f832dbcd9ee1ef0ed33ce';
  User.findById(userID)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
      next();
    });
});
/////////////////////////////////////////////////

app.use('/admin', adminRoutes);
app.use(publicRoutes);
app.use(authRoutes);

app.use(errorControler.get404);

const PORT = 3000;

//Replace the following url connection by your own connection.
//Try to follow the specified format.
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    return User.findOne();
  })
  .then(foundUser => {
    if (!foundUser) {
      const user = new User({
        name: 'Osiris',
        email: 'osirisr1994@gmail.com',
        cart: [],
      });
      user.save();
    }
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
