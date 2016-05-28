'use strict';

module.exports = function(options) {
  let util = require('util');
  let path = require('path');
  let fs = require('fs');
  let target = {};
  let handler = {};

  let useOptions = {
    paths: [], mapping: {}, guessName: function(name) {
      return '';
    }
  };

  let setMapping = function(items) {
    if (false === util.isObject(items)) {
      return;
    }

    let allowed = {'string': true, 'object': false, 'function': false};

    Object.keys(items).forEach(function(index) {
      let item = items[index];
      let type = typeof item;

      if ((null === item) || (false === allowed.hasOwnProperty(type))) {
        return;
      }

      if (allowed[type]) {
        useOptions.mapping[index] = item;
      } else {
        target[index] = item;
      }
    });
  };

  let setPaths = function(items) {
    if (false === util.isArray(items)) {
      return;
    }

    let data = {};

    items.forEach(function(item) {
      if (path.isAbsolute(item) && fs.existsSync(item)) {
        data[item] = true;
      }
    });

    useOptions.paths = Object.keys(data);
  };

  let setOptions = function(items) {
    if (false === util.isObject(items)) {
      return;
    }

    if (items.hasOwnProperty('paths')) {
      setPaths(items.paths);
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
    let items = {};

    if (mapping.hasOwnProperty(property)) {
      items[mapping[property]] = true;
    }

    items[property] = true;
    items[packageName(property)] = true;

    try {
      let guessName = useOptions.guessName(property);

      if (('string' === typeof guessName) && ('' !== guessName)) {
        items[guessName] = true;
      }

      return Object.keys(items);
    } catch (error) {
      return Object.keys(items);
    }
  };

  let buildNames = function(property) {
    let names = getNames(property);
    let items = {};

    if (0 === useOptions.paths.length) {
      return names;
    }

    names.forEach(function(name) {
      if (path.isAbsolute(name)) {
        items[name] = true;
        return;
      }

      useOptions.paths.forEach(function(from) {
        let longName = path.resolve(from, name);
        items[longName] = true;
      });

      items[name] = true;
    });

    return Object.keys(items);
  };

  let getRequire = function(property) {
    let value = null;

    buildNames(property).every(function(name) {
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

