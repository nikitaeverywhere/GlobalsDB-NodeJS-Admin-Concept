/**
 * This module represents different setting for application.
 */
module.exports = new function() {

    this.db = {
        globalsDBInstallationPath: process.env.GLOBALS_HOME,
        globalsDBDatabaseDirectory: "/mgr"

    };
    this.app = {
        absolutePath: "Z:/ZitRos/Developing/NodeJS/GlobalsDB_interface/"
    };
    this.SERVER_PORT = 81;
    this.SERVER_DOMAIN = "172.27.25.133";

};

