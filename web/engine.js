module.exports = new function() {

    var db = require("./../database.js");

    this.about = function() {
        return db.getInfo();
    };

    this.getGlobal = function() {

    };

};