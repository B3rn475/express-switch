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
            i += 1;
            middleware(req, res, step);
        }
        step();
    };
}

function convertPattern(pattern) {
    if (pattern === undefined) {
        throw new Error('pattern cannot be undefined');
    } else if (typeof pattern !== 'object' || util.isArray(pattern) || pattern instanceof RegExp) {
        throw new Error('patter must be an object');
    } else if (!pattern.hasOwnProperty("case")) {
        throw new Error('missing case in pattern');
    } else if (typeof pattern.case !== 'object' || util.isArray(pattern.case) || pattern.case instanceof RegExp) {
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
    if (pattern.hasOwnProperty("default")) {
        if (!isMiddleware(pattern.default) && !isMiddlewareArray(pattern.default)) {
            throw new Error('invalid middleware for default');
        }
        cPattern.default = toMiddleware(pattern.default);
    }
    return cPattern;
}

function Switch(getter, pattern) {
    if (getter === undefined) {
        throw new Error('the getter cannot be undefined');
    }
    if (typeof getter !== 'function') {
        throw new Error('the getter has to be a function');
    }
    pattern = convertPattern(pattern);

    var middleware;
    if (getter.length < 3) {
        middleware = function (req, res, done) {
            done(getter(req, res));
        };
    } else {
        middleware = getter;
    }

	function doValue(value, req, res, next) {
		var route = pattern.case[value] || pattern.default || nothing;
        route(req, res, next);
	}

	function doArray(array, req, res, next) {
		var index = 0;
		function doStep(err) {
			if (err) {
                return next(err);
            }
			if (array.length <= index) {
				return next();
			}
			var value = array[index];
			index += 1;
			doValue(value, req, res, doStep);
		}
		doStep();
	}

    return function (req, res, next) {
        middleware(req, res, function (value, err) {
            if (err) {
                return next(err);
            }
            if (util.isArray(value)) {
				doArray(value, req, res, next);
			} else {
				doValue(value, req, res, next);
			}
        });
    };
}

module.exports = Switch;
