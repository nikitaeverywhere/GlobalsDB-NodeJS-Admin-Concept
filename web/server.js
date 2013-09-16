module.exports = new function() {

    var http = require("http"),
        fileSystem = require("fs"),
        settings = require("../settings.js"),
        queryString = require('querystring'),
        engine = require("./engine.js"),
        db = require("../database.js"),
        server = null;

    var FILE_TYPES = {
        "html": "text/html",
        "css": "text/css",
        "js": "text/javascript",
        "jpg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif"
    };

    var getGlobal = function(request, responce, callback) {

        var generateBred = function() {

            var genName = function() {
                var s = "", l = Math.random()*10;
                for (var i = 0; i < l; i++) {
                    s += String.fromCharCode(Math.floor(Math.random()*26 + 65))
                }
                return s;
            };

            var obj = {
                status: "ok",
                children: {

                }
            };
            var l = Math.random()*6;
            for (var i = 0; i < l; i++) {
                obj.children[i+""] = {
                    n: genName(),
                    t: Math.floor(Math.random()*4)
                }
            }

            return obj;
        };

        var body = "";
        request.on('data', function (data) {
            body += data;
        });
        request.on('end',function(){
            var bred = generateBred();
            var nodeArray = body.split(",");
            nodeArray.splice(0,1);
            var ro = {
                status: "ok",
                count: 0,
                children: {

                }
            };

            db.getLevel(nodeArray, function(result, data) {
                for (var i = 0; i < data.length; i++) {
                    (function(i){
                        db.getData(nodeArray.concat(data[i]), function(result, data2) {
                            var t = (data2.data)?2:1;
                            ro.children[i] = {
                                n: data[i],
                                t: t,
                                v: data2.data || ""
                            };
                            if (ro.count++ === data.length - 1) {
                                callback.call(this, JSON.stringify(ro));
                            }
                        });
                    })(i);
                }
            });
            //db.getLevel(["root","people","0", "name"], console.log);

        });
    };

    /**
     * Returns contents of file located in root directory or empty string if file not found.
     *
     * @param request
     * @param response
     * @param callback
     */
    var getWebFile = function(request, response, callback) {

        var args = request.url.indexOf("?");
        var fileWebPath = request.url.substr(0,(args===-1)?request.url.length:args);
        if (fileWebPath.charAt(fileWebPath.length - 1) === "/") fileWebPath += "index.html";
        var fileWebName = settings.app.absolutePath + "web/root" + fileWebPath,
            data;

        if (fileWebPath === "/data") {
            getGlobal(request, response, function(data) {
                callback.call(this, {
                    status: 200,
                    contentType: "application/json",
                    body: data
                });
            })
        } else if (fileSystem.existsSync(fileWebName)) {

            var fileContent = fileSystem.readFileSync(fileWebName);
            data = {
                status: 200,
                contentType: FILE_TYPES[fileWebPath.substr(fileWebPath.lastIndexOf(".") + 1)] || "text/plain",
                body: fileContent
            };
            callback.call(this, data);

        } else {

            data = {
                status: 404,
                contentType: "text/html",
                body: "File <b>" + fileWebPath + "</b> not found on server!" // @improve: make constant
            };
            callback.call(this, data);

        }

    };

    /**
     * Client request handler.
     *
     * @param request
     * @param response
     */
    var request = function(request, response) {

        getWebFile(request, response, function(data) {
            response.writeHead(data.status, {
                "Content-Type": data.contentType
            });
            response.end(data.body);
        });

    };

    /**
     * Causes web server to listen requests.
     */
    this.start = function() {
        server = http.createServer(request);
        server.listen(settings.SERVER_PORT, settings.SERVER_DOMAIN);
        console.log("Web Server started to listen on " + settings.SERVER_DOMAIN + ":" + settings.SERVER_PORT);
        return true;
    };

    /**
     * Causes web server to stop listening requests.
     */
    this.stop = function() {
        if (!server) console.log("Server not up!");
        server.stop();
        server = null;
    };

};
