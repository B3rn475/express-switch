/*jslint node: true, nomen: true*/
/*global describe, it*/
/**
* Developed By Carlo Bernaschina (GitHub - B3rn475)
* www.bernaschina.com
*
* Distributed under the MIT Licence
*/
"use strict";

var assert = require("assert"),
    eswitch = require("../");

describe('structure', function () {
    it('should be a function', function () {
        assert.equal(typeof eswitch, 'function');
    });
    it('should return a middleware', function () {
        var middleware = eswitch(function () {}, {"case": {}});
        assert.equal(typeof middleware, 'function');
        assert.equal(middleware.length, 3);
    });
    it('should throw with less than 2 arguments', function () {
        assert.throws(function () { eswitch(); });
    });
    it('should throw with invalid getter', function () {
        var pattern = {"case": {}};
        assert.throws(function () { eswitch(undefined, pattern); });
        assert.throws(function () { eswitch(null, pattern); });
        assert.throws(function () { eswitch(0, pattern); });
        assert.throws(function () { eswitch("", pattern); });
        assert.throws(function () { eswitch(/^/, pattern); });
        assert.throws(function () { eswitch({}, pattern); });
        assert.throws(function () { eswitch([], pattern); });
    });
    describe('pattern', function () {
        it('should throw with invalid pattern', function () {
            var getter = function () {};
            assert.throws(function () { eswitch(getter, undefined); });
            assert.throws(function () { eswitch(getter, null); });
            assert.throws(function () { eswitch(getter, 0); });
            assert.throws(function () { eswitch(getter, ""); });
            assert.throws(function () { eswitch(getter, /^/); });
            assert.throws(function () { eswitch(getter, {}); });
            assert.throws(function () { eswitch(getter, []); });
        });
        it('should throw with invalid case', function () {
            var getter = function () {};
            assert.throws(function () { eswitch(getter, {"case": undefined}); });
            assert.throws(function () { eswitch(getter, {"case": null}); });
            assert.throws(function () { eswitch(getter, {"case": 0}); });
            assert.throws(function () { eswitch(getter, {"case": ""}); });
            assert.throws(function () { eswitch(getter, {"case": /^/}); });
            assert.throws(function () { eswitch(getter, {"case": function () {}}); });
            assert.throws(function () { eswitch(getter, {"case": []}); });
        });
        it('should throw with invalid case value', function () {
            var getter = function () {};
            assert.throws(function () { eswitch(getter, {"case": {value: undefined}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: null}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: 0}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: ""}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: /^/}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: {}}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: function () {}}}); });
            assert.throws(function () { eswitch(getter, {"case": {value: function (req, res, next, another) {}}}); });
        });
        it('should throw with invalid default', function () {
            var getter = function () {};
            assert.throws(function () { eswitch(getter, {"case": {}, "default": undefined}); });
            assert.throws(function () { eswitch(getter, {"case": {}, "default": null}); });
            assert.throws(function () { eswitch(getter, {"case": {}, "default": 0}); });
            assert.throws(function () { eswitch(getter, {"case": {}, "default": ""}); });
            assert.throws(function () { eswitch(getter, {"case": {}, "default": /^/}); });
            assert.throws(function () { eswitch(getter, {"case": {}, "default": {}}); });
        });
        it('should not throw with valid case', function () {
            var getter = function () {};
            eswitch(getter, {"case": {}, "default": []});
            eswitch(getter, {"case": {}, "default": [function (req, res) {}]});
            eswitch(getter, {"case": {}, "default": function (req, res, next) {}});
        });
        it('should not throw with valid default', function () {
            var getter = function () {};
            eswitch(getter, {"case": {value: []}});
            eswitch(getter, {"case": {value: [function (req, res) {}]}});
            eswitch(getter, {"case": {value: function (req, res, next) {}}});
        });
    });
    it('should forward req and res', function () {
        var req_e = {}, res_e = {},
            getter = function (req, res) {
                assert.equal(req, req_e);
                assert.equal(res, res_e);
            },
            pattern = {"case": {}};
        eswitch(getter, pattern)(req_e, res_e, function () {});
    });
});

describe('synchronous', function () {
    it('should call next', function () {
        var req = {}, res = {},
            getter = function () {},
            pattern = {"case": {}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, undefined);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should call the right case', function () {
        var req = {}, res = {},
            getter = function () { return "value"; },
            done = false,
            pattern = {"case": {value: function (req, res, next) {
                done = true;
                next();
            }}};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, true);
    });
    it('should call the right case (array)', function () {
        var req = {}, res = {},
            getter = function () { return "value"; },
            done = 0,
            pattern = {"case": {value: [function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }]}};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, 2);
    });
    it('should call default', function () {
        var req = {}, res = {},
            getter = function () { return "novalue"; },
            done = false,
            pattern = {"case": {value: function (req, res, next) {
                throw "Should not call me";
            }}, "default": function (req, res, next) {
                done = true;
                next();
            }};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, true);
    });
    it('should call the right defult (array)', function () {
        var req = {}, res = {},
            getter = function () { return "novalue"; },
            done = 0,
            pattern = {"case": {value: function (req, res, next) {
                next();
            }}, "default": [function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }]};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, 2);
    });
    it('should manage next', function () {
        var req = {}, res = {},
            getter = function () { return "value"; },
            pattern = {"case": {value: function (req, res, next) {
                next();
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, undefined);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error', function () {
        var req = {}, res = {},
            getter = function () { return "value"; },
            pattern = {"case": {value: function (req, res, next) {
                next("error");
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error (array)', function () {
        var req = {}, res = {},
            getter = function () { return "value"; },
            pattern = {"case": {value: [function (req, res, next) {
                next("error");
            }, function (req, res, next) {
                throw "Should not be called";
            }]}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
    it('should call all the values', function () {
        var req = {}, res = {},
            done = 0,
            getter = function () { return [1, 2]; },
            pattern = {"case": {"1": function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, "2": function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }}};
        eswitch(getter, pattern)(req, res, function (err) {});
        assert.equal(done, 2);
    });
    it('should forward the error with values', function () {
        var req = {}, res = {},
            getter = function () { return [1, 2]; },
            pattern = {"case": {"1": function (req, res, next) {
                next("error");
            }, "2": function (req, res, next) {
                throw "Should not be called";
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
});

describe('asynchronous', function () {
    it('should call next', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done(); },
            pattern = {"case": {}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, undefined);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should call the right case', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("value"); },
            done = false,
            pattern = {"case": {value: function (req, res, next) {
                done = true;
                next();
            }}};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, true);
    });
    it('should call the right case (array)', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("value"); },
            done = 0,
            pattern = {"case": {value: [function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }]}};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, 2);
    });
    it('should call default', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("novalue"); },
            done = false,
            pattern = {"case": {value: function (req, res, next) {
                throw "Should not call me";
            }}, "default": function (req, res, next) {
                done = true;
                next();
            }};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, true);
    });
    it('should call the right defult (array)', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("novalue"); },
            done = 0,
            pattern = {"case": {value: function (req, res, next) {
                next();
            }}, "default": [function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }]};
        eswitch(getter, pattern)(req, res, function () {});
        assert.equal(done, 2);
    });
    it('should manage next', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("value"); },
            pattern = {"case": {value: function (req, res, next) {
                next();
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, undefined);
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error (getter)', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done(undefined, "error"); },
            pattern = {"case": {value: function (req, res, next) {
                throw "Should not be called";
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error (middleware)', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("value"); },
            pattern = {"case": {value: function (req, res, next) {
                next("error");
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
    it('should forward error (array)', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done("value"); },
            pattern = {"case": {value: [function (req, res, next) {
                next("error");
            }, function (req, res, next) {
                throw "Should not be called";
            }]}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
    it('should call all the values', function () {
        var req = {}, res = {},
            done = 0,
            getter = function (req, res, done) { done([1, 2]); },
            pattern = {"case": {"1": function (req, res, next) {
                assert.equal(done, 0);
                done = 1;
                next();
            }, "2": function (req, res, next) {
                assert.equal(done, 1);
                done = 2;
                next();
            }}};
        eswitch(getter, pattern)(req, res, function (err) {});
        assert.equal(done, 2);
    });
    it('should forward the error with values', function () {
        var req = {}, res = {},
            getter = function (req, res, done) { done([1, 2]); },
            pattern = {"case": {"1": function (req, res, next) {
                next("error");
            }, "2": function (req, res, next) {
                throw "Should not be called";
            }}},
            done = false;
        eswitch(getter, pattern)(req, res, function (err) {
            assert.equal(err, "error");
            done = true;
        });
        assert.equal(done, true);
    });
});