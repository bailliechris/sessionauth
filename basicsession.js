// Creates an express-session that records the user (Sent as JSON {user: "Name"} in req.body)
// Records the URL visited if either foo, bar or show

var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');

var app = express();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 40000
    }
}));

app.use(function (req, res, next) {

    // Initialise if views json doesn't exist
    // Set up correctly - use store.js for help
    if (!req.session.views) {
        req.session.views = {};
        
    }

    // get the url pathname
    var pathname = parseurl(req).pathname;

    // get user viewing the page - based on submitted data
    var userview = req.body.user;

    if (req.session.views[userview]) {
        console.log("Found user");

        if (!req.session.views[userview].hasOwnProperty(pathname)) {
            req.session.views[userview][pathname] = 1;
        } else {
            req.session.views[userview][pathname] += 1;
        }

        console.log(req.session.views);
    } else {
        console.log("No such user found - creating session");
        let visit = {};
        visit[pathname] = 1;

        req.session.views[userview] = visit;

        console.log(req.session.views);
        
    }

    // count the views
 //   req.session.views[userview] = (req.session.views[userview] || 0) + 1;

    next();
});

app.get('/foo', function (req, res, next) {
    res.send(req.session.views[req.body.user]);
})

/*
app.get('/foo', function (req, res, next) {
    res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
})*/

app.get('/bar', function (req, res, next) {
    res.send(req.session.views[req.body.user]);
});

app.get('/show', function (req, res, next) {
    res.send(req.session.views[req.body.user]);
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