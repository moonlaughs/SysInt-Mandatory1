var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 8088;

app.use(bodyParser.json());

// post function
app.post('/generate-nemID', function(req, res){
    //console.log("CPR: " + req.body.cpr + " | Email: " + req.body.email);
    var rand5 = Math.floor(Math.random() * 99999) + 10000;
    var last4 = req.body.cpr.slice(-4);
    res.status(201);
    res.send('{"nemId": "' + rand5 + '-' + last4 + '"}');
});

// start the server
app.listen(port);
console.log('Server started! POST to http://localhost:8088/generate-nemID');