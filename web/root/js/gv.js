/**
 * Global viewer object - engine for application.
 *
 * Required:
 *  hid.js
 *  basic.js
 */
var gv = new function() {

    var LAST_NODE_ID = 0,
        LAST_LAYER = 0;

    this.world = {

    };

    var dom = new function() {

        this.element = function(id) {
            return document.getElementById(id);
        };

        this.getWorld = function() {
            return this.element("gv-nodesContainer");
        };

        this.getContainer = function() {
            return this.element("gv-container");
        };

        this.attachLink = function(name) {
            var link = document.createElement("div");
            var linkText = document.createElement("div");
            linkText.className = "gv-linkText";
            linkText.innerHTML = name;
            link.className = "gv-link";
            link.appendChild(linkText);
            link.style.zIndex = LAST_LAYER;
            this.getWorld().appendChild(link);
            return link;
        };

    };

    var handlers = {
        nodeMove: function(pointer) {
            this.style.left = pointer.x - this.clientWidth/2 + "px";
            this.style.top = pointer.y - this.clientHeight/2 + "px";
        }
    };

    var addNode = function(id, name) {



    };

    var Node = function(name, value, type) {

        this.originalID = value + "\\" + name;
        if (value === "") {value = "<span class=\"inactive\">null</span>"}
        this.name = value;
        this.nodeName = name;
        this.parent = {};
        this.child = {};
        this.type = (type === undefined)?1:type;
        this.x = 0;
        this.level = 0;
        this.y = 0;
        this.active = 0;
        this.r = 0;
        this.domElement = null;
        this.id = LAST_NODE_ID++;
        gv.world.append(this);

    };

    Node.prototype = {

        domElement: null,
        name: "",
        type: 1,
        originalID: "",
        nodeName: "",
        id: -1,
        level: 0,
        active: 0,
        x: 0,
        y: 0,
        r: 0,
        physics: { // proto
            distance: 0,
            angle: 0,
            timer: 0
        },
        parent: {},
        child: {},
        check: function(node) {
            return node instanceof Node;
        },
        addChild: function(node) {
            if (!this.check(node)) return;
            var link = dom.attachLink(node.nodeName);
            this.parent.append({
                node: this,
                linkElement: link
            });
            node.child.append({
                node: node,
                linkElement: link
            });
        },
        physicsStep: function(obj) {
            obj.x += obj.physics.distance*Math.cos(Math.PI/2-obj.physics.angle)/2;
            obj.y += obj.physics.distance*Math.sin(Math.PI/2-obj.physics.angle)/2;
            obj.physics.distance /= 2;
            obj.update();
            if (obj.physics.distance < 1) {
                clearInterval(obj.physics.timer);
                obj.physics.timer = 0;
            }
        },
        hasChilds: function() {
            for (var a in this.child) {
                if (!this.child.hasOwnProperty(a)) continue;
                return 1;
            }
            return 0;
        },
        // todo check for existence
        addParent: function(node) {
            if (!this.check(node)) return;
            this.level = node.level + 1;
            var link = dom.attachLink(this.nodeName);
            this.parent.append({
                node: node,
                linkElement: link
            });
            node.child.append({
                node: this,
                linkElement: link
            });
        },
        getHTMLRoot: function() {

        },
        slide: function(a, distance) { // make as light as possible
            //if (!a || !b) return;
            var b = this, dx = a.x - b.x, dy = a.y - b.y, l = Math.sqrt(dx*dx + dy*dy) - (distance) - 10;
            if (l > a.r + b.r) return; // not colliding
            var f = (a.r + b.r - l)/5, d = Math.PI/2 - Math.atan2(dx, dy),
                fx = f*Math.cos(d), fy = f*Math.sin(d);
            //a.x += fx; b.x -= fx;
            //a.y += fy; b.y -= fy;
            a.x += fx*4; a.y += fy*4;
            if (Math.abs(fx) + Math.abs(fy) > 0.001) setTimeout(function(){a.slide(b, distance)}, 25);
            a.updateView();
        },
        updateView: function() {
            if (!this.domElement) return;
            this.domElement.style.left = this.x - this.r + "px";
            this.domElement.style.top = this.y - this.r + "px";
            var i = this;
            i.domElement.style.zIndex = LAST_LAYER;
            var updateLink = function(property) {
                var l = this[property].linkElement;
                var o = this[property].node;
                var or = o.r;
                var ir = i.r;
                var dx = o.x - i.x;
                var dy = o.y - i.y;
                var len = Math.sqrt(dx*dx + dy*dy) - ir - or + 1;
                var dir = Math.PI/2 - Math.atan2(o.x - i.x, o.y - i.y);
                if (dir < 0) dir += Math.PI*2;
                if (dir > Math.PI*2) dir -= Math.PI*2;
                if (dir > Math.PI*2) dir -= Math.PI*2;
                if (dir > Math.PI/2 && dir < Math.PI*1.5) {
                    dir -= Math.PI;
                    var t = or;
                    or = ir;
                    ir = t;
                }
                l.style["transform"] = l.style["-ms-transform"] = l.style["-o-transform"] = l.style["-moz-transform"] =
                    l.style["-webkit-transform"] = "rotate("+dir+"rad)";
                l.style.width = Math.max(len, 0) + "px";
                l.style.opacity = Math.min(i.domElement.style.opacity, o.domElement.style.opacity) || 1;
                l.style.left = (o.x - or*Math.cos(dir) + i.x + ir*Math.cos(dir))/2 - len/2 + "px";
                l.style.top = (o.y - or*Math.sin(dir) + i.y + ir*Math.sin(dir))/2 - l.clientHeight/2 - 1 + "px";
                l.style.zIndex = LAST_LAYER;
            };
            LAST_LAYER++;
            this.child.foreach(updateLink);
            this.parent.foreach(updateLink);
        },
        /**
         * Updates node position.
         */
        update: function() {
            var me = this;
            this.parent.foreach(function(you){
                me.slide(this[you].node, this[you].linkElement.childNodes[0].clientWidth)
            });
            this.child.foreach(function(you){
                me.slide(this[you].node, this[you].linkElement.childNodes[0].clientWidth)
            });
            this.updateView();
        },
        _repeatClickHandler: function() {
            // todo
        },
        _startMoveHandler: function(pointer) {
            var i = this,
                level = this._parentNode.level;
            gv.world.foreach(function(p){
                this[p].active = false;
                var oo = this[p].domElement.style.opacity;
                if (this[p].level === level || this[p].level === level + 1) {
                    this[p].domElement.style.opacity = 1;
                } else {
                    this[p].domElement.style.opacity = 0.2;
                }
                if (oo !== this[p].domElement.style.opacity) {
                    this[p].updateView();
                }
            });
            setTimeout(function(){i._parentNode.active = true}, 1);
            pointer.origX = pointer.x - i._parentNode.x;
            pointer.origY = pointer.y - i._parentNode.y;
        },
        _moveHandler: function(pointer) {
            this._parentNode.x = pointer.x - (pointer.origX || 0);
            this._parentNode.y = pointer.y - (pointer.origY || 0);
            this._parentNode.update();
        },
        _clickHandler: function() {
            var i = this;
            if (i._parentNode.active && i._parentNode.hasChilds()) {
                i._parentNode._repeatClickHandler();
            }
            server.post("data",function(data){
                try {eval("data = " + data)} catch(e) {}
                i._parentNode.demo_expand(data);
            }, this._parentNode.getTreePath());
        },
        getTreePath: function() {

            var path = [];

            var fall = function(node) {
                path.push(node.nodeName);
                if (node.parent["0"]) {
                    fall(node.parent["0"].node);
                }
            };

            fall(this);

            return path.reverse();

        },
        attachToScene: function() {
            var node = document.createElement("div");
            node.className = "gv-node gv-nodeType-"+this.type;
            node._parentNode = this;
            node.id = "node" + this.id;
            var span = document.createElement("div");
            span.innerHTML = this.name;
            dom.getWorld().appendChild(node);
            node.appendChild(span);
            var w = span.clientWidth + 10;
            var sh = span.clientHeight;
            node.style.width = node.style.height = w + "px";
            span.style.marginTop = w/2 - sh/2 + "px";
            node.style.zIndex = LAST_LAYER;
            this.r = (node.clientWidth + 2)/2;
            hid.bind("pointerMove", node, this._moveHandler);
            hid.bind("pointerPress", node, this._clickHandler);
            hid.bind("pointerStart", node, this._startMoveHandler);
            this.domElement = node;
            this.update();
        },
        detachFromScene: function() {
            // todo
        },
        demo_expand: function(testObj) {
            if (!testObj || !testObj.status || !testObj.children) return;
            var i = this;
            var n = 0, c = 0;
            testObj.children.foreach(function(){n++});
            testObj.children.foreach(function(p){
                var it = this[p];
                var ok = true;
                i.child.foreach(function(x){if (this[x].node.originalID === it.v + "\\" + it.n) ok = false});
                if (!ok) return;
                var node = gv.createNode(it.n, it.v, it.t);
                var d = c*Math.PI*2/n;
                node.x = i.x + Math.cos(d)*50; node.y = i.y + Math.sin(d)*50;
                node.addParent(i);
                node.attachToScene();
                c++;
            })
        }

    };

    this.createNode = function(label, value, type) {
        return new Node(label, value, type);
    };

    this.initialize = function() {

        if (hid) hid.initialize();
        if (server) server.initialize();

        var node = this.createNode("USER", "user", 0);
        node.x = 3300;
        node.y = 3300;
        node.attachToScene();

        var world = dom.getContainer();
        world.scrollLeft = 3000;
        world.scrollTop = 3000;

    };

};
