express-switch
==============

__express-switch__ is a pattern matching middleware for __express__

### Parameters

```js
eSwitch(getValue, pattern)
```

 - __getValue__ (mandatory) a synchronous function that returns the value to match
 - __patter__ (mandatory) an object that describes the different routes to follow depending on the value returned by __getValue__

```js
var express = require('express');
var eSwitch = require('express-switch');
var app = express();

...

app.use(eSwitch(
    function(req, res){
        return req.user.role;
    },
    {
        case: {
            ADMIN: middleware1,
            REGISTERED: [middleware2, middleware3]
        },
        default: middleware5
    }
));

...

app.listen(3000);
```

### Pattern

The pattern is an object with the following properties.

 - __case__ (mandatory) a lookup table of middlewares.
 - __default__ (optional) the default route to follow if none of the cases matches.

### Installation

```bash
$ npm install express
```
