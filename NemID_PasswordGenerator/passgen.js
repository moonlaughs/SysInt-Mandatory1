var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 8089;

app.use(bodyParser.json());

// post function
app.post('/generate-password-nemID', function(req, res){
    //console.log("NemID: " + req.body.nemId + " | CPR: " + req.body.cpr);
    var first2nem = req.body.nemId.slice(0,2);
    var last2cpr = req.body.cpr.slice(-2);
    res.status(200);
    res.send('{"nemIdPassword": "' + first2nem + last2cpr + '"}');
});

// start the server
app.listen(port);
console.log('Server started! POST to http://localhost:8089/generate-password-nemID');