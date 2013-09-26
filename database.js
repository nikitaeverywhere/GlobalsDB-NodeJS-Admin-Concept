module.exports = new function() {

    var dbModule = require("./modules/cache.node"),
        settings = require("./settings.js"),
        fs = require("fs"), // @debug
        db = new dbModule.Cache(),
        OPENED = false;

    this.getInfo = function() {
        return db.about();
    };

    this.fillTestData = function() {
        if (!OPENED) return;
        db.set("root", "2 ways");
        db.set("root", "people", 0, "name", "Jack");
        db.set("root", "people", 0, "age", 25);
        db.set("root", "people", 0, "gender", 0);
        db.set("root", "people", 1, "name", "Henry");
        db.set("root", "people", 1, "age", 12);
        db.set("root", "people", 1, "gender", 0);
        db.set("root", "people", 2, "name", "Goose");
        db.set("root", "people", 2, "age", 2);
        db.set("root", "people", 2, "gender", 1);
        db.set("root", "people", 2, "Goose");
        db.set("root", "people", 3, "name", "Olga");
        db.set("root", "people", 3, "age", 12);
        db.set("root", "people", 3, "gender", 1);
        db.set("root", "loot", 0, "baggage");
        db.set("root", "loot", 1, "message");
        db.set("root", "loot", 2, "plant");
        db.set("root", "loot", 3, "box");
        db.set("root", "loot", 3, "box", "9 items");
        db.set("root", "loot", 3, "box", "9 items");
        db.set("root", "loot", 3, "box", "item1", "knife");
        db.set("root", "loot", 3, "box", "item2", "clock");
        db.set("root", "loot", 3, "box", "item3", "pen");
        db.set("root", "loot", 3, "box", "item4", "letter");
        db.set("root", "loot", 3, "box", "item5", "egg");
        db.set("root", "loot", 3, "box", "item6", "key");
        db.set("root", "loot", 3, "box", "item7", "Guf");
        db.set("root", "loot", 3, "box", "item8", "paper");
        db.set("root", "loot", 3, "box", "item9", "wood");
        console.log("Test data assigned.");
    };

    /*

    global_directory() // to list globals in namespace
    increment(g,l,o,b,*n) // to increment global value simultaneously
    kill() / set() // to kill/set node
    lock()/unlock() // to protect
    merge({to: {}, from: {}})
    next() previous() // subscripts
    next_node(node), previous_node() // defined: 0 if no next
    order(), next()
    retrieve() // 'array', 'list', 'object'

     */

    this.getData = function(globalArray, callBack) {  // sync!
        //console.log(globalArray);
        var global = globalArray[0];
        if (globalArray == undefined) {callBack.call(this); return}
        db.get({
            global: global,
            subscripts: globalArray.slice(1)
        }, callBack);
    };

    this.getLevel = function(globalArray, callBack) {
        if (globalArray == false) {
            db.global_directory({}, callBack);
            return;
        }
        db.retrieve({
            global: globalArray[0],
            subscripts: globalArray.slice(1)
        }, "list", callBack);
    };

    this.connect = function() {
        var d = process.cwd(); // remember current directory
        var result = db.open({
            path: settings.db.globalsDBInstallationPath + settings.db.globalsDBDatabaseDirectory,
            username: '_SYSTEM',
            password: 'SYS',
            namespace: 'USER'})["ok"];
        if (result) OPENED = true;
        process.chdir(d); // restore directory because of GlobalsDB changes it
        return result;
    };

    this.disconnect = function() {
        db.close(function(error, result) {
            if (error) {
                console.log(result);
            } else {
                OPENED = false;
                console.log("Disconnected from database.");
            }
        })
    };

};