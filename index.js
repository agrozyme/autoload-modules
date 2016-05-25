'use strict';

module.exports = function(options) {
  var useOptions = {
    guessName: function(name) {
      return '';
    }, mapping: {}
  };

  var cache = {};
  var target = {};
  var handler = {};

  var isObject = function(item) {
    return (null !== item) && ('object' === typeof item);
  };

  var setOptions = function(options) {
    if (false === isObject(options)) {
      return;
    }

    if (options.hasOwnProperty('guessName') && ('function' === typeof options.guessName)) {
      useOptions.guessName = options.guessName;
    }

    if (options.hasOwnProperty('mapping') && isObject(options.mapping)) {
      useOptions.mapping = options.mapping;
    }
  };

  var packageName = function(name) {
    return name.trim().replace(/([a-z\d])([A-Z]+)/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase();
  };

  var getNames = function(name) {
    let names = [name, packageName(name)];

    try {
      let guessName = useOptions.guessName(name);

      if (('string' === typeof guessName) && ('' !== guessName)) {
        names.push(guessName);
      }

      return names;
    } catch (error) {
      return names;
    }
  };

  var getFromMapping = function(target, property) {
    const items = useOptions.mapping;

    if (false === items.hasOwnProperty(property)) {
      return null;
    }

    if (target.hasOwnProperty(property)) {
      return target[property];
    }

    try {
      target[property] = require(items[property]);
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

    cache[property] = getFromMapping(target, property);

    if (null !== cache[property]) {
      return cache[property];
    }

    const names = getNames(property);
    cache[property] = getFromTarget(target, names);

    if (null !== cache[property]) {
      return cache[property];
    }

    cache[property] = getFromRequire(target, names);

    if (null !== cache[property]) {
      return cache[property];
    }

    delete cache[property];
    const error = new Error("Cannot find module '" + property + "'");
    error.code = 'MODULE_NOT_FOUND';
    throw error;
  };

  setOptions(options);
  return new Proxy(target, handler);
};

let $ = module.exports();
console.log($.noextist);
