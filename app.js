var express = require('express');
var router = require('./routes/routes');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(router);

app.listen(3000);
console.log("Host listening at port 3000");
