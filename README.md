express-switch
---

  [![NPM Version][npm-image]][npm-url]

__express-switch__ is a pattern matching middleware for __express__

### Installation

```bash
$ npm install express-switch
```

### Parameters

```js
eSwitch(getter, pattern)
```

 - __getter__ (mandatory) a function that returns the value to match against the pattern
 - __pattern__ (mandatory) an object that describes the different routes to follow depending on the value returned by the __getter__

Getter
---

The __getter__ is a function that is responsible to compute the value to match against the cases.
This function can be __synchronous__ or __asynchronous__.

### Synchronous

The __getter__ is __synchronous__ when the number of parameters is less than 3.
It has to return the value.

__prototype__

```js
    function (req, res) { /* ... */ return value; }
```

__example__

```js
var express = require('express');
var eSwitch = require('express-switch');
var app = express();

// ...

app.use(eSwitch(
    function(req, res){
        return value; // here you have to return the value to match against the cases
    },
    {
        case: {
            CASE1: middleware1, // this will be executed if the getter returns 'CASE1'
            CASE2: [middleware2, middleware3] // these will be execute if the getter returns 'CASE2'
        },
        default: middleware5 // this will be executed if the getter return neither 'CASE1' nor 'CASE2'
    }
));

// ...

app.listen(3000);
```

### Asynchronous
The __getter__ is __asynchronous__ when the number of parameters is more than 2.
It has to forward the value to the __done__ callback.

__prototype__

```js
    function (req, res, done) {
        // ...
        if (error) {
            done(undefined, error);
        } else {
            done(value);
        }
        // ...
    }
```

__example__


```js
var express = require('express');
var eSwitch = require('express-switch');
var app = express();

// ...

app.use(eSwitch(
    function(req, res, done){
        something.doAsync(req, res, function(err, value){
            if (err){
                return done(undefined, err); // error forwarding
            }
            done(value); // you have to forward to the done callback the value to match against the cases
        });
    },
    {
        case: {
            CASE1: middleware1, // this will be executed if the getter returns 'CASE1'
            CASE2: [middleware2, middleware3] // these will be execute if the getter returns 'CASE2'
        },
        default: middleware5 // this will be executed if the getter return neither 'CASE1' nor 'CASE2'
    }
));

// ...

app.listen(3000);
```

### Return an Array
If the __getter__ returns/forwards and __Array__ all the values will be analized sequencially, unless one of the middlewares forwards an error.

Pattern
---

The pattern is an object with the following properties.

 - __case__ (mandatory) a lookup table of middlewares or arrays of middlewares.
 - __default__ (optional) the default route to follow if none of the cases matches.

__prototye__

```js
    var pattern = {
        case : {
            "value 1" : middleware1,
            "value 2" : [middleware2, middleware 3],
            // ...
            "value N" : middleware
        },
        default : middleware // optional
    }
```

[npm-image]: https://img.shields.io/npm/v/express-switch.svg?style=flat
[npm-url]: https://npmjs.org/package/express-switch
