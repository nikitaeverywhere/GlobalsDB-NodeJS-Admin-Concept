/**
 * Human input device wrapper object.
 *
 * Version: 0.4
 *
 * Required:
 *  basic.js
 */
var hid = new function() {

    var specVar = "!hid", // special variable name that will be handled by html-objects
        pointer = { // pointer object
            stack: {

            },
            STATES: {
                NONE: 0,
                PRESS: 1,
                MOVE: 2,
                RELEASE: 3
            }
        };

    // updates pointer
    var updatePointer = function(id, pointerObject) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        pointer.stack[id].merge(pointerObject);
    };

    // @debug
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

    // call binders for event for event target and it's parents
    var callBinders = function(eventName, currentPointer) {

        var forObject = function(object) {
            if (object.hasOwnProperty(specVar) && object[specVar].valid) {
                object[specVar].binds[eventName].foreach(function(prop){
                    this[prop].call(object, currentPointer);
                    blockEvent(currentPointer.originalEvent);
                })
            }
            return object.parentNode;
        };

        var object = currentPointer.target;
        while (object) { // down recursively calling handler for every parent of target
            object = forObject(object);
        }
        return 1;

    };

    var handlers = {

        pointerStart: function(event, id, x, y, cX, cY, target) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                originX: x,
                originY: y,
                pageX: x,
                pageY: y,
                clientX: cX,
                clientY: cY,
                originalEvent: event,
                state: pointer.STATES.PRESS,
                target: target
            };
            pointer.principal = currentPointer;
            pointer.stack[id] = currentPointer;
            //console.log(currentPointer.originalEvent);
            callBinders("pointerStart", currentPointer);

        },

        pointerMove: function(event, id, x, y, cX, cY) {

            if (!pointer.stack[id]) return;
            var currentPointer = {
                id: id,
                x: x,
                y: y,
                pageX: x,
                pageY: y,
                clientX: cX,
                clientY: cY,
                originalEvent: event,
                state: pointer.STATES.MOVE
            };

            updatePointer(id, currentPointer);
            callBinders("pointerMove", pointer.stack[id]);

        },

        pointerEnd: function(event, id, x, y, cX, cY) {

            if (!pointer.stack[id]) return;
            pointer.stack[id].merge({
                x: x,
                y: y,
                pageX: x,
                pageY: y,
                clientX: cX,
                clientY: cY,
                //originalEvent: event,
                state: pointer.STATES.RELEASE
            });
            if (!pointer.stack.hasOwnProperty(id)) return;
            if (pointer.stack[id].originX === x && pointer.stack[id].originY === y) {
                callBinders("pointerPress", pointer.stack[id]);
            }
            callBinders("pointerEnd", pointer.stack[id]);
            removePointer(id);
        },

        pointerPress: function() { // todo: re-organize calls

        }

    };

    /**
     * Binds cross-application pointer(s) event.
     *
     * @param eventName
     * @param target
     * @param handler
     */
    this.bind = function(eventName, target, handler) {
        if (handlers.hasOwnProperty(eventName)) {
            if (!target) {
                console.log("Target not specified for event " + eventName);
                return;
            }
            if (!target.hasOwnProperty(specVar) || !target[specVar].valid) {
                target[specVar] = {
                    binds: {
                        pointerStart: {},
                        pointerMove: {},
                        pointerEnd: {},
                        pointerPress: {},
                        keyDown: {},
                        keyUp: {},
                        keyPress: {},
                        hoverStart: {},
                        hoverEnd: {}
                    },
                    valid: true
                }
            }
            target[specVar].binds[eventName].append(handler);
        } else console.log("No such event \"" + eventName + "\" for hid.bind")
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
            var touch = e.touches[e.touches.length - 1];
            handlers.pointerStart(e, touch.identifier, touch.pageX,
                touch.pageY, touch.clientX, touch.clientY, target);
        });

        this.bindBrowserEvent('touchmove', document, function(e){
            e = fixEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.pointerMove(e, this[el].identifier, this[el].pageX, this[el].pageY, this[el].clientX, this[el].clientY);
            });
        });

        this.bindBrowserEvent('touchend', document, function(e){
            e = fixEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.pointerEnd(e, this[el].identifier, this[el].pageX, this[el].pageY, this[el].clientX, this[el].clientY);
            });
        });

        this.bindBrowserEvent('mousedown', document, function(e){
            e = fixEvent(e);
            var target = e.target || e.toElement;
            handlers.pointerStart(e, 1, e.pageX, e.pageY, e.clientX, e.clientY, target);
        });

        this.bindBrowserEvent('mouseup', document, function(e){
            e = fixEvent(e);
            handlers.pointerEnd(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });

        this.bindBrowserEvent('mousemove', document, function(e){
            e = fixEvent(e);
            handlers.pointerMove(e, 1, e.pageX, e.pageY, e.clientX, e.clientY)
        });

    };

};