var static = require('node-static');
var file = new static.Server();
console.log('Creating static server');
require('http').createServer(function(request, response) {
  console.log('request received');
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 3000);
