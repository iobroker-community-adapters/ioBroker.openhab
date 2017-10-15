var http = require('http');
var fs   = require('fs');

function OpenHAB(options) {
    options = options || {};
    options.port = parseInt(options.port, 10) || 8080;
    //create a server object:
    this.server = http.createServer(function (req, res) {
        if (req.url.match(/^\/rest\/items/)) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            var text = fs.readFileSync(__dirname + '/items.json');
            text = JSON.parse(text);
            res.write(JSON.stringify(text));
            res.end();
        } else if (req.url.match(/^rest/)) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(require(__dirname + '/rest.json')));
            res.end();
        } else {
            res.write('Hello World!'); //write a response to the client
            res.end(); //end the response
        }
    }).listen(options.port); //the server object listens on port 8080

    this.close = function () {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    };

    return this;
}

if (module && module.parent) {
    module.exports = OpenHAB;
} else {
    new OpenHAB();
}
