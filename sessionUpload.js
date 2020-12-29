// Creates an express-session that records the user (Sent as JSON {user: "Name"} in req.body)
// Records the URL visited if either foo, bar or show

// Experiment attempt to upload data whilst logged in

// Load in .env file with details of users / secrets to be hidden
require('dotenv').config();

// Should use the express-basic-auth
var cors = require('cors')
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var basicAuth = require('express-basic-auth');
var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

// Get user details from the user file
//const users = require('./utility/user');

//Connect to MONGODB Get whole document
async function loadCollection() {
    //mongodb+srv://posts_user:<password>@learningcluster-5qutw.azure.mongodb.net/test?retryWrites=true&w=majority
    const uri = process.env.MONGO_URI;
    const client = new mongodb(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();

    //Load DB "vuefullstack" and table "posts"
    return client.db("ssleague").collection("users");
}

// Custom authorizer using basic-auth
// Async, gets users from MongoDB, returns all that pass
async function checkUser(username, password, cb) {
    const users = await loadCollection();

    let query = {};

    query.user = username;
    query.pw = password;

    let result = await users.find(query).toArray();

    console.log(result);
 
    if (result.length > 0)
        return cb(null, true, result)
    else
        return cb(null, false)
}

// Custom unauthorised response for basic-auth
function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

var app = express();

// Middleware to log requests
var log = function (req, res, next) {
    //console.log(req.auth);
    next();
}

// checking for auth - takes JSON in form username:password returns TRUE if success
var jsonBodyAuth = basicAuth( {
    //users, // <- use details from .env
    //users: { 'admin': 'password' },
    authorizer: checkUser,
    authorizeAsync: true,
    unauthorizedResponse: { unauthorizedResponse: getUnauthorizedResponse }
});

// Check if user already has a cookie, so is allowed on the next page
var checkSession = function (req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.sendStatus(401);
    }
}

//Set up CORS to allow requests from client
var corsOptions = {
    origin: "http://localhost:8080",
    credentials: true,
};

// Add all app.use instructions
app.use(cors(corsOptions));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Set up session and store
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
    cookie: {
        expires: 40000
    }
}));

// Standard response to pinging the server
app.get('/', function (req, res, next) {
    res.send("Welcome!");
});

// Login route using jsonbody basic auth
// Currently using log middleware logging everything for test purposes

// Improved to record entered username in the session and redirect
app.post('/login', log, jsonBodyAuth, function (req, res, next) {
    req.session.user = req.auth.user;
    console.log("Login Success");
    res.status(200).send("Logged In");
    
//    res.redirect('/user');
});

// Returns users details if logged in - 
app.get('/user', checkSession, function (req, res, next) {
    res.status(200).send("Logged In!" + " " + req.session.user);
})

// Protected route - check with session
app.get('/foo', checkSession, function (req, res, next) {
    res.send("You're still logged in!" + " " + req.session.user);
})

// Protected route - reads and parrots back .data from the body of the request
// (If you're logged in!)
app.post('/upload', checkSession, function (req, res, next) {
    let content = req.body.data;

    console.log("Upload Triggered");

    res.status(200).send("Received" + content);
})

// Logout endpoint - logs everyone out?
app.get('/logout', checkSession, function (req, res) {
    req.session.destroy();
    res.send("logout success!");
});

// Unknown Route Error
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
    
    let url = parseurl(req).pathname;

    console.log("Requested Path", url);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
    console.log('Listening on', PORT);
});