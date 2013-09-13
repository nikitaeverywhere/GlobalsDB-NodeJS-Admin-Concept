var server = new function() {

    var getXmlHttp = function() {
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    };

    var makeRequest = function(url, caching, data, method, handler) {

        if (typeof caching === "undefined") caching = false;
        method = method.toLowerCase();
        var req = getXmlHttp();
        caching = (method == "get")?(((url.indexOf("?") === -1)?"?":"&") + "cache=" +
            ((caching)?1:new Date().getTime())):"";

        req.onreadystatechange = function() {

            if (req.readyState == 4) { //req.statusText

                if(req.status == 200) {
                    console.log(req.responseText);
                    handler.call(null,req.responseText,1);
                } else {
                    handler.call(null,null,0);
                    console.log("Ajax GET error: ",req.statusText,req.responseText);
                }

            }

        };

        req.open(((method === "get")?"get":"post"), url + caching, true);
        req.send(((method === "get")?null:data));

    };

    /**
     * Gets data from server and handles it with handler.
     *
     * @param url
     * @param handler
     * @param data
     * [ @param caching ]
     */
    this.get = function(url, handler, data, caching) {

        makeRequest(url, caching, data, "get", handler);

    };

    /**
     * Gets data from server and handles it with handler.
     *
     * @param url
     * @param handler
     * @param data
     */
    this.post = function(url, handler, data) {

        makeRequest(url, false, data, "post", handler);

    };

    this.initialize = function() {

        // nothing to do

    };

};
