//
// MongoLab node.js Gratuitous 3D demo
// Copyright 2011 ObjectLabs, Corp.
//

//
// Globals
//
var sys = require("sys");
var fs = require("fs");
var http = require("http");
var url = require("url");
var mongoose = require("mongoose");  
var config = require("./config");   // config.js holds database parameters, 
                                    // access credentials, allowed filenames

// Some syntactic sugar for the config.js parameters.
var loginCredentials = config.username + ":" + config.password;
var dbUrl = config.databaseUrl;
var dbName = config.databaseName;
var allowedFiles = config.allowedFiles;

var portno = 80;		// The network port to listen on. 

//
// Start running here.
//
processCmd();			// Process Command Line args.
initializeDb();			// Start connection to MongoDb
startServer();			// Start the http server.
//
// That's all.
//

//
// startServer() fires up an http server and sets it to listen 
// on a network port (default is port 80).
//
function startServer() {
    console.log("Starting http server.");
    var myServer = http.createServer (serverCallback);
    myServer.listen(portno, logServerStartCallback);
}

//
// Opens connection to MongoDB database, authenticates, logs successful connection.
//
function initializeDb() {
    mongoose.connection.on("open", function() {
	console.log("Connected to MongoDB successfully!");});
    mongoose.connect("mongodb://" + loginCredentials + "@" + dbUrl + "/" + dbName);	  
}

//
// serverCallback() is passed to http.createServer to be invoked each
// time a new http request arrives.  Its two tasks are to log each
// request to the console and to wrap the call to dispatch() with a
// try/catch block that keeps the server running in the event of an
// error. 
//
function serverCallback(req, res) 
{
    try {
	console.log("http request received from: " +
		    req.connection.remoteAddress +
		    " for href: " + url.parse(req.url).href
		   );

	// Real work gets done in dispatch.
	dispatch(req, res);

    } catch (err) {
	// Something didn't work.  Send error back to http client. 
	// Log error to console.  We don't terminate, so the server
	// will keep processing instead of dying.
	sys.puts(err);
	res.writeHead(500);
	res.end("Internal Server Error...gaak");
    }
}

//
// A trivial callback that is passed to the .listen() invocation that
// logs a successful server starting and ready to accept connections.
function logServerStartCallback() {
	console.log("http server open for business.");
}

//
// Queries a MongoDB collection to retrieve data based on
// properties supplied by json parameter.
//
function query (collectionIdent, json, callback) {
    mongoose.connection.db.collection(collectionIdent, function (err, collection) {
        collection.find(json).toArray(callback);
    });
}

//
// Inserts into a MongoDB collection and returns inserted data
//
function insert (collectionIdent, json, callback) {
    mongoose.connection.db.collection(collectionIdent, function (err, collection) {
        collection.insert(json);
		});
}

// 
// Some meta-state for the application to track what entry we'll send.
// Also used to detect when another entry has been added to the database. 
//
var maxEntry = 0;
var currentEntry = 1;

//
// dispatch() does the main job of handling new server requests by dispatching based
// on pathname.  'getentry' and 'newentry' are special pathnames that query or
// insert, respectively, into the MongoDB database and then return an appopriate
// result.  Other requests are compared against a list of allowed filenames and if
// there is a match, the file is returned to the requester.  All other requests
// return an error page or error code.  dispatch() is called by the serverCallback()
// function bound when the http Server is initialized.
//
function dispatch(req, res) {
    //some private methods
    var serverError = function(code, content) {
	res.writeHead(code, {"Content-Type": "text/plain"});
	res.end(content);
    };
    
    var renderHtml = function(content) {
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end(content, "utf-8");
    };
    
    var randomFromTo = function(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
    };

    var urlparts = url.parse(req.url);
    
    // TODO validate req.url
    if (urlparts.pathname == "/getentry") {
	// Query MongoLab
 	query("guestbook", {"entry":{"$exists": true}}, function (err, docs) {
	    if (err) {
		console.log("Query error", err);
		return;
	    }
	    if (maxEntry < docs.length) { // Someone added a guestbook entry since my last visit, start from top
		currentEntry = maxEntry - 1; 
		maxEntry = docs.length;
	    } else {
		currentEntry = currentEntry - 1;
	    }
	    if (currentEntry < 0) currentEntry = docs.length - 1;
 	    renderHtml(docs[currentEntry].entry);
	});
    } else if (urlparts.pathname == "/addentry") {
	var querystring = urlparts.query.split("&");
	var value = "";
	var patt = /entry=/;
	querystring.forEach(function (item) {
	    if (patt.test(item)) { 
		value = item.replace(patt,"");
		value = decodeURI (value);
		value = value.replace(/\+/g," "); // TODO: better way to pass in " " in parameters like a post body.
		value = value.substr(0,20);	  // For safety, truncate to 20 chars.
	    }});
	if (value == "") {
	    renderHtml("query malformed: " + urlparts.query);
	} else {
	    insert ("guestbook", {"entry": value}, function (err, docs) {
		if (err) {
		    console.log("Insert error", err);
		    return;
		}});
	    renderHtml(value);
	}
	
    } else {			// Let's see if an allowFiles was requested.
	var filen = allowedFiles[req.url];
	if (filen == undefined) filen = "error.html"; // couldn't understand the pathname, send error.html 
	filen = "./webroot/" + filen;
	console.log ("fetching: " + filen);

	fs.readFile(filen, function(error, content) {
	    if (error) {
		serverError(500);
	    } else {
		renderHtml(content);
	    }
	});
    }}



//
// Command line processing
//
var argvskip = false;

function processCmd() {
    process.argv.forEach(function (val, index, array) {
	switch(val)
	{
	case "--port":
	case "-p":
	    portno = array[index+1];
	    argvskip = true;
	    break;
	default:
	    if (index >= 2 && argvskip == false) { // TODO Improve way to detect if we're past the node args
		printusage();
	    } else {
		argvskip = false;
	    }
	}
    });
}

function printusage() {
    console.log ("usage: server.js [-p|--port] <portnumber>");
    process.exit(1);
}

