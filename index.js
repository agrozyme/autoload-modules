'use strict';

module.exports = function(options) {
  var useOptions = {debug: false, rename: {}};
  var cache = {};
  var target = {};
  var handler = {};

  var setOptions = function(options) {
    for (let name in useOptions) {
      if (useOptions.hasOwnProperty(name) && options.hasOwnProperty(name)) {
        useOptions[name] = options[name];
      }
    }
  };

  var packageName = function(name) {
    return name.trim().replace(/([a-z\d])([A-Z]+)/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase();
  };

  var debugMessage = function(error) {
    var debug = useOptions.debug;

    if ('function' === typeof debug) {
      debug(error);
    }

    if (debug) {
      console.error(error);
    }
  };

  var getFromRename = function(target, property) {
    const rename = useOptions.rename;

    if (false === rename.hasOwnProperty(property)) {
      return null;
    }

    if (target.hasOwnProperty(property)) {
      return target[property];
    }

    try {
      target[property] = require(rename[property]);
      return target[property];
    } catch (error) {
      return null;
    }
  };

  var getFromTarget = function(target, names) {
    let value = null;

    names.every(function(name) {
      if (target.hasOwnProperty(name)) {
        value = target[name];
        return false;
      }

      return true;
    });

    return value;
  };

  var getFromRequire = function(target, names) {
    let value = null;

    names.every(function(name) {
      try {
        target[name] = require(name);
        value = target[name];
        return false;
      } catch (error) {
        return true;
      }
    });

    return value;
  };

  handler.get = function(target, property, receiver) {
    if (cache.hasOwnProperty(property)) {
      return cache[property];
    }

    cache[property] = getFromRename(target, property);

    if (null !== cache[property]) {
      return cache[property];
    }

    const names = [property, packageName(property)];
    cache[property] = getFromTarget(target, names);

    if (null !== cache[property]) {
      return cache[property];
    }

    cache[property] = getFromRequire(target, names);

    if (null !== cache[property]) {
      return cache[property];
    }

    delete cache[property];
    debugMessage(new Error("Cannot find module '" + property + "'"));
    return undefined;
  };

  setOptions(options);
  return new Proxy(target, handler);
};
