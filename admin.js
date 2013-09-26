var core = new function() {

    var webServer = require("./web/server.js"),
        fs = require("fs"),
        db = require("./database.js");

    if (!db.connect()) {
        console.log("Failed to initialize database.");
        return;
    }

    db.fillTestData(); // @debug
    webServer.start();
    console.log("Application initialized successfully.");

};