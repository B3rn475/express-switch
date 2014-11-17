express-switch
==============

__express-switch__ is a pattern matching middleware for __express__

### Parameters

```js
eSwitch(getValue, pattern)
```

 - __getValue__ (mandatory) a synchronous function that return the value to match
 - __patter__ an object that describes the different routes to follow depending on the value return by __getValue__

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

### Installation

```bash
$ npm install express
```