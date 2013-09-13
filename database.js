module.exports = new function() {

    var dbModule = require("./modules/cache.node"),
        settings = require("./settings.js"),
        db = new dbModule.Cache(),
        OPENED = false;

    this.getInfo = function() {
        return db.about();
    };

    function fillTestData() {
        if (!OPENED) return;
            db.set("root", "people", 0, "name", "Jack");
            db.set("root", "people", 0, "age", 25);
            db.set("root", "people", 0, "gender", 0);
            db.set("root", "people", 1, "name", "Henry");
            db.set("root", "people", 1, "age", 12);
            db.set("root", "people", 1, "gender", 0);
            db.set("root", "people", 2, "name", "Goose");
            db.set("root", "people", 2, "age", 2);
            db.set("root", "people", 2, "gender", 1);
            db.set("root", "people", 3, "name", "Olga");
            db.set("root", "people", 3, "age", 12);
            db.set("root", "people", 3, "gender", 1);
            db.set("root", "loot", 0, "baggage");
            db.set("root", "loot", 1, "message");
            db.set("root", "loot", 2, "plant");
        console.log( JSON.stringify(db.data({
            global: "root",
            subscripts: ["people", 0]
        }), null, '\t'));
    }

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

    this.getData = function(globalArray) {  // sync!
        var global = globalArray.splice(0,1)[0];
        var data = db.get({
            global: global,
            subscripts: globalArray
        });
        return data.data;
    };

    this.getLevel = function(globalArray, callBack) {
        if (globalArray == false) {
            db.global_directory({}, callBack);
            return;
        }
        db.retrieve({
            global: globalArray.splice(0,1)[0],
            subscripts: globalArray
        }, "list", callBack);
    };

    this.connect = function() {
        var result = db.open({
            path: settings.db.globalsDBInstallationPath + settings.db.globalsDBDatabaseDirectory,
            username: '_SYSTEM',
            password: 'SYS',
            namespace: 'USER'})["ok"];
        if (result) OPENED = true;
        return result;
    };

    this.disconnect = function() {
        db.close(function(error, result) {
            if (error) {
                console.log(result);
            } else {
                OPENED = false;
                console.log("Disconnected from database");
            }
        })
    };

};