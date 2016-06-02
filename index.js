'use strict';

module.exports = (options) => {
  let util = require('util');
  let path = require('path');
  let fs = require('fs');
  let useOptions = {paths: new Set(), mapping: {}, guess: (name) => ''};
  let target = {};
  let handler = {};

  let setMapping = (items) => {
    if (false === util.isObject(items)) {
      return;
    }

    let allowed = {'string': true, 'object': false, 'function': false};

    Object.keys(items).forEach((index) => {
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

  let setPaths = (items) => {
    if (false === util.isArray(items)) {
      return;
    }

    items.forEach((item) => {
      if (path.isAbsolute(item) && fs.existsSync(item) && fs.statSync(item).isDirectory()) {
        useOptions.paths.add(item);
      }
    });
  };

  let setOptions = (items) => {
    if (false === util.isObject(items)) {
      return;
    }

    if (items.hasOwnProperty('paths')) {
      setPaths(items.paths);
    }

    if (items.hasOwnProperty('guess') && ('function' === typeof items.guess)) {
      useOptions.guess = items.guess;
    }

    if (items.hasOwnProperty('mapping')) {
      setMapping(items.mapping)
    }
  };

  let packageName = (property) => property.trim()
    .replace(/([a-z\d])([A-Z]+)/g, '$1-$2')
    .replace(/[-\s]+/g, '-')
    .toLowerCase();

  let getNames = (property) => {
    let mapping = useOptions.mapping;
    let items = new Set();

    if (mapping.hasOwnProperty(property)) {
      items.add(mapping[property]);
    }

    items.add(property).add(packageName(property));

    try {
      let guess = useOptions.guess(property);

      if (('string' === typeof guess) && ('' !== guess)) {
        items.add(guess);
      }

      return items;
    } catch (error) {
      return items;
    }
  };

  let buildNames = (property) => {
    let names = getNames(property);
    let items = new Set();

    if (0 === useOptions.paths.length) {
      return names;
    }

    names.forEach((name) => {
      if (path.isAbsolute(name)) {
        items.add(name);
        return;
      }

      useOptions.paths.forEach((from) => {
        items.add(path.resolve(from, name));
      });

      items.add(name);
    });

    return items;
  };

  let getRequire = (property) => {
    let value = null;
    let names = buildNames(property);

    [...names].every((name) => {
      try {
        value = require(name);
        return false;
      } catch (error) {
        if ('MODULE_NOT_FOUND' === error.code) {
          return true;
        }

        throw error;
      }
    });

    return value;
  };

  handler.get = (target, property) => {
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

