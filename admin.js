var core = new function() {

    var webServer = require("./web/server.js"),
        db = require("./database.js");

    if (!db.connect()) {
        console.log("Failed to initialize database.");
        return;
    }

    webServer.start();
    console.log("Application initialized successfully.");

};