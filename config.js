//
// MongoLab node.js Gratuitous 3D demo
// Copyright 2011 ObjectLabs, Corp.
//

//
// MongoDB connectivity configuration
//
// THIS IS WHERE TO ADD MONGOLAB CONFIG INFO
// exports.databaseUrl = "dbh<server>.mongolab.com:<port>";
// exports.databaseName = "nodelove";
// exports.username = "";
// exports.password = "";
//				
// BELOW is to connect to locally running MongoDB server
exports.username = "";
exports.password = "";
exports.databaseUrl = "localhost";
exports.databaseName = "nodelove";

//
// allowedFiles: array of "inbound URL pathnames" mapped to allowed filenames to limit potentially malicious behaviors
//
exports.allowedFiles = { "/index.html" : "index.html",
			 "/" : "index.html",
			 "/3dmongodemo.js" : "3dmongodemo.js",
			 "/glge-compiled-min.js" : "glge-compiled-min.js",
			 "/jquery-1.6.4.min.js" : "jquery-1.6.4.min.js", 
			 "/level.xml" : "level.xml",
			 "/map.png" : "map.png",
			 "/glgelogo.png" : "glgelogo.png",
			 "/MongoLabLogo.jpg" : "MongoLabLogo.jpg",
			 "/crate.jpg" : "crate.jpg",
			 "/wallnorm.jpg" : "wallnorm.jpg",
			 "/random.txt" : "random.txt",
			 "/LICENSE": "LICENSE"};



