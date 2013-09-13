/**
 * Some prototypes to simplify work with objects.
 */

/**
 * Foreach operator for object's properties. Usage:
 * someObject.foreach(function(property){ someActions(this[property]) })
 *
 * @param callback {function}
 */
Object.prototype.foreach = function(callback) {
    for (var property in this) {
        if (!this.hasOwnProperty(property)) continue;
        callback.call(this, property)
    }
};

/**
 * Applies property to object. Returns new generated property name.
 *
 * @param value {*}
 * @returns {string}
 */
Object.prototype.append = function(value) {
    var index = 0;
    while (this.hasOwnProperty(index + "")) index++;
    this[index + ""] = value;
    return index + "";
};

/**
 * Merges target object with current object.
 * All properties of current object will be rewritten by given object's properties.
 *
 * @param object {object}
 */
Object.prototype.merge = function(object) {

    var combine = function(target,object) {
        for (var property in object) {
            if (!object.hasOwnProperty(property)) continue;
            target[property] = object[property]; // note about properties-objects
        }
    };

    combine(this,object);

};
