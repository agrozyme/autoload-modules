'use strict';

module.exports = function(options) {
  var useOptions = {
    guessName: function(name) {
      return '';
    }, mapping: {}
  };

  var target = {};
  var handler = {};

  var isObject = function(item) {
    return (null !== item) && ('object' === typeof item);
  };

  var setMapping = function(items) {
    if (false === isObject(items)) {
      return;
    }

    Object.keys(items).every(function(index) {
      let item = items[index];

      switch (typeof item) {
        case 'string':
          useOptions.mapping[index] = item;
          break;

        case 'object':
        case 'function':
          target[index] = item;
          break;

        default:
          break;
      }
    });
  };

  var setOptions = function(items) {
    if (false === isObject(items)) {
      return;
    }

    if (items.hasOwnProperty('guessName') && ('function' === typeof items.guessName)) {
      useOptions.guessName = items.guessName;
    }

    if (items.hasOwnProperty('mapping')) {
      setMapping(items.mapping);
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

    try {
      target[property] = require(items[property]);
      return target[property];
    } catch (error) {
      return null;
    }
  };

  var getFromRequire = function(target, names) {
    let value = null;

    names.every(function(name) {
      try {
        value = require(name);
        return false;
      } catch (error) {
        return true;
      }
    });

    return value;
  };

  handler.get = function(target, property, receiver) {
    if (target.hasOwnProperty(property)) {
      return target[property];
    }

    target[property] = getFromMapping(target, property);

    if (null !== target[property]) {
      return target[property];
    }

    const names = getNames(property);
    target[property] = getFromRequire(target, names);

    if (null !== target[property]) {
      return target[property];
    }

    delete target[property];
    const error = new Error("Cannot find module '" + property + "'");
    error.code = 'MODULE_NOT_FOUND';
    throw error;
  };

  setOptions(options);
  return new Proxy(target, handler);
};
