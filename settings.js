/**
 * This module represents different setting for application.
 */
module.exports = new function() {

    /**
     * Because application represents only conceptual part of administrative tools, do not use it for real projects.
     * Check database.js file. Settings are hardcoded.
     *
     * Requirements:
     *  - GlobalsDB with NodeJS adapter v1 (version is important)
     *  - NodeJS
     *  - Settings changes
     *
     *  IMPORTANT!
     *  Also check db.connect method!
     *  Comment line with fillTestData evaluation if you have any data in your database.
     */

    this.db = {
        globalsDBInstallationPath: process.env.GLOBALS_HOME,
        globalsDBDatabaseDirectory: "/mgr"

    };
    this.app = {

    };
    this.SERVER_PORT = 80;
    this.SERVER_DOMAIN = "127.0.0.1";

};

