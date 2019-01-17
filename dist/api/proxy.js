var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100mb';
console.log('Using limit: ', myLimit);
app.use(bodyParser.json({limit: myLimit}));
app.all('/proxy', function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    res.header("Access-Control-Expose-Headers", "Retry-After");
    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        var params = req.url;
        params = params.slice(6);
        var options = { url: targetURL + params, method: req.method, headers: {
            'Authorization': req.header('Authorization'),
            'Accept': req.header('Accept'),
            'Content-Type': req.header('Content-Type'),
          }
        };
        if (req.method != "GET") {
          options.json = req.body;
        }
        console.log(options);
        request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    console.log(response);
                }
            }).pipe(res);
    }
});
app.set('port', process.env.PORT || 3002);
app.listen(app.get('port'));
