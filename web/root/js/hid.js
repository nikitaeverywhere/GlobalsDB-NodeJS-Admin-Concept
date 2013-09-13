/**
 * Human input device wrapper object.
 *
 * Required:
 *  basic.js
 */
var hid = new function() {

    var pointer = {
        stack: {

        },
        principal: { // principal pointer holds last registered pointer data.
            x: 0,
            y: 0,
            originX: 0,
            originY: 0,
            state: 0,
            target: null
        },
        binds: {
            start: {

            },
            move: {

            },
            end: {

            },
            click: {

            }
        },
        STATES: {
            NONE: 0,
            PRESS: 1,
            MOVE: 2,
            RELEASE: 3
        },
        pointers: 0 // number of current pointers
    };

    // updates pointer
    var updatePointer = function(id, pointerObject) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        pointer.stack[id].merge(pointerObject);
    };

    this.getInner = function() { return pointer };

    // removes pointer
    var removePointer = function(id) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        delete pointer.stack[id];
    };

    var blockEvent = function(e) {
        e.returnValue = false;
        e.cancelBubble = true;
        if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    var Binder = function(target, handler) {
        this.target = target;
        this.handler = handler;
    };

    /**
     * Returns principal pointer object.
     *
     * @returns {*}
     */
    this.pointer = function() { return pointer.principal };

    var callBinders = function(eventName, currentPointer, event) {
        var e = pointer.binds[eventName]; if (!e) return 0;
        var object = currentPointer.target;
        while (object) {
            e.foreach(function(property) {
                var t = this[property].target;
                if (t === object) {
                    blockEvent(event);
                    this[property].handler.call(object, currentPointer);
                }
            });
            object = object.parentNode;
        } return 1;
    };

    var handlers = {

        start: function(event, id, x, y, target) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                originX: x,
                originY: y,
                state: pointer.STATES.PRESS,
                target: target
            };
            pointer.principal = currentPointer;
            pointer.stack[id] = currentPointer;
            callBinders("start", currentPointer, event);

        },

        move: function(event, id, x, y) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                state: pointer.STATES.MOVE
            };
            pointer.principal.merge(currentPointer);

            if (!pointer.stack.hasOwnProperty(id)) return;
            updatePointer(id, currentPointer);
            callBinders("move", pointer.stack[id], event);

        },

        end: function(event, id, x, y) {

            if (!pointer.stack[id]) return;
            pointer.stack[id].merge({
                x: x,
                y: y,
                state: pointer.STATES.RELEASE
            });
            if (!pointer.stack.hasOwnProperty(id)) return;
            if (pointer.stack[id].originX === x && pointer.stack[id].originY === y) {
                callBinders("click", pointer.stack[id], event);
            }
            callBinders("end", pointer.stack[id], event);
            removePointer(id);
        }

    };

    /**
     * Binds cross-application pointer(s) event.
     *
     * @param event
     * @param target
     * @param handler
     */
    this.bindPointer = function(event, target, handler) {
        if (pointer.binds.hasOwnProperty(event)) {
            pointer.binds[event].append(new Binder(target, handler));
        } else console.log("No such event \"" + event + "\" for pointer.binds")
    };

    /**
     * Cross-browser binding of browser events. For cross-browser application events use hid.bind method.
     *
     * @param event
     * @param element
     * @param handler
     */
    this.bindBrowserEvent = function (event, element, handler) {
        if (element.addEventListener) {
            element.addEventListener(event,handler,false);
        } else if (element.attachEvent) {
            element.attachEvent("on"+event, handler);
        } else {
            element[event] = handler;
        }
    };

    this.initialize = function() {

        var fixEvent = function(e) {
            return e || window.event;
        };

        // todo unselectable="on" as attribute for opera

        this.bindBrowserEvent('touchstart', document, function(e){
            e = fixEvent(e);
            var target = e.target || e.srcElement;
            //blockEvent(e);
            handlers.start(e, e.touches[e.touches.length - 1].identifier, e.touches[e.touches.length - 1].pageX,
                e.touches[e.touches.length - 1].pageY, target);
        });

        this.bindBrowserEvent('touchmove', document, function(e){
            e = fixEvent(e);
            //blockEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.move(e, this[el].identifier, this[el].pageX, this[el].pageY);
            });
        });

        this.bindBrowserEvent('touchend', document, function(e){
            e = fixEvent(e);
            //blockEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.end(e, this[el].identifier, this[el].pageX, this[el].pageY);
            });
        });

        this.bindBrowserEvent('mousedown', document, function(e){
            e = fixEvent(e);
            var target = e.target || e.toElement;
            handlers.start(e, 1, e.pageX, e.pageY, target);
        });

        this.bindBrowserEvent('mouseup', document, function(e){
            e = fixEvent(e);
            handlers.end(e, 1, e.pageX, e.pageY)
        });

        this.bindBrowserEvent('mousemove', document, function(e){
            e = fixEvent(e);
            handlers.move(e, 1, e.pageX, e.pageY)
        });

    };

};