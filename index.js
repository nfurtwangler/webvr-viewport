var static = require('node-static');
var file = new static.Server();
var port = process.env.PORT || 3000;

console.log('Creating static server on port:  ' + port);

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
}).listen(port);
