'use strict';

module.exports = function(options) {
  let target = {};
  let handler = {};

  let useOptions = {
    mapping: {}, guessName: function(name) {
      return '';
    }
  };

  let isObject = function(item) {
    return (null !== item) && ('object' === typeof item) && (false === (item instanceof Array));
  };

  let setMapping = function(items) {
    if (false === isObject(items)) {
      return;
    }

    let allowed = {'string': true, 'object': false, 'function': false};

    Object.keys(items).every(function(index) {
      let item = items[index];
      let type = typeof item;

      if ((null === item) || (false === allowed.hasOwnProperty(type))) {
        return true;
      }

      if (allowed[type]) {
        useOptions.mapping[index] = item;
      } else {
        target[index] = item;
      }

      return true;
    });
  };

  let setOptions = function(items) {
    if (false === isObject(items)) {
      return;
    }

    if (items.hasOwnProperty('guessName') && ('function' === typeof items.guessName)) {
      useOptions.guessName = items.guessName;
    }

    if (items.hasOwnProperty('mapping')) {
      setMapping(items.mapping)
    }
  };

  let packageName = function(property) {
    return property.trim().replace(/([a-z\d])([A-Z]+)/g, '$1-$2').replace(/[-\s]+/g, '-').toLowerCase();
  };

  let getNames = function(property) {
    let mapping = useOptions.mapping;
    let names = [];

    if (mapping.hasOwnProperty(property)) {
      names.push(mapping[property]);
    }

    names.push(property);
    names.push(packageName(property));

    try {
      let guessName = useOptions.guessName(property);

      if (('string' === typeof guessName) && ('' !== guessName)) {
        names.push(guessName);
      }

      return names;
    } catch (error) {
      return names;
    }
  };

  let getRequire = function(property) {
    let value = null;

    getNames(property).every(function(name) {
      try {
        value = require(name);
        return false;
      } catch (error) {
        return true;
      }
    });

    return value;
  };

  handler.get = function(target, property) {
    if (target.hasOwnProperty(property)) {
      return target[property];
    }

    target[property] = getRequire(property);

    if (null !== target[property]) {
      return target[property];
    }

    delete target[property];
    let error = new Error("Cannot find module '" + property + "'");
    error.code = 'MODULE_NOT_FOUND';
    throw error;
  };

  setOptions(options);
  return new Proxy(target, handler);
};
