/*jslint node: true, nomen: true, es5: true */
/**
 * Developed By Carlo Bernaschina (GitHub - B3rn475)
 * www.bernaschina.com
 *
 * Distributed under the MIT Licence
 */
"use strict";

var util = require('util');

function nothing(req, res, next) {
    next();
}

function isMiddleware(middleware) {
    return typeof middleware === 'function' && 2 <= middleware.length && middleware.length <= 3;
}

function isMiddlewareArray(array) {
    if (!util.isArray(array)) {
        return false;
    }
    var valid = true;
    array.forEach(function (middleware) {
        valid = valid && isMiddleware(middleware);
    });
    return valid;
}

function toMiddleware(input) {
    if (typeof input === 'function') {
        return input;
    }
    var middlewares = [];
    input.forEach(function (middleware) {
        middlewares.push(middleware);
    });
    return function (req, res, next) {
        var i = 0;
        function step(err) {
            if (err) {
                return next(err);
            }
            if (i === middlewares.length) {
                return next();
            }
            var middleware = middlewares[i];
            i = i + 1;
            middleware(req, res, step);
        }
        step();
    };
}

function convertPattern(pattern) {
    if (pattern === undefined) {
        throw new Error('pattern cannot be undefined');
    } else if (typeof pattern !== 'object') {
        throw new Error('patter must be an object');
    } else if (pattern.case === undefined) {
        throw new Error('missing case in pattern');
    } else if (typeof pattern.case !== 'object') {
        throw new Error('case must be an object');
    }

    var cPattern = {case: {}};

    Object.keys(pattern.case).forEach(function (key) {
        var middleware = pattern.case[key];
        if (!isMiddleware(middleware) && !isMiddlewareArray(middleware)) {
            throw new Error('invalid middleware for case "' + key + '"');
        }
        cPattern.case[key] = toMiddleware(middleware);
    });
    if (pattern.default !== undefined) {
        if (!isMiddleware(pattern.default) && !isMiddlewareArray(pattern.default)) {
            throw new Error('invalid middleware for case default');
        }
        cPattern.default = toMiddleware(pattern.default);
    }
    return cPattern;
}

function Switch(getValue, pattern) {
    if (getValue === undefined) {
        throw new Error('getValue cannot be undefined');
    }
    if (typeof getValue !== 'function') {
        throw new Error('getValue has to be a function');
    }
    pattern = convertPattern(pattern);

    return function (req, res, next) {
        var value = getValue(req, res),
            route = pattern.case[value] || pattern.default || nothing;
        route(req, res, next);
    };
}

module.exports = Switch;
