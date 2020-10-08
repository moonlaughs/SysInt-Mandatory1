var express = require('express');
var bodyParser = require('body-parser');
var dbFile = '../NemID_ESB/nem_id_database.sqlite';
const sqlite3 = require('sqlite3');
var app = express();
var port = process.env.PORT || 8090;

var db = new sqlite3.Database(dbFile);
app.use(bodyParser.json());

app.post('/nemid-auth', function (req, res) {
    var nemIdCode = req.body.nemIdCode;
    var nemId = req.body.nemId;
    
    let generatedCode = Math.floor(100000 + Math.random() * 900000);

    let query = "SELECT Password FROM User WHERE NemID = ?";
    db.all(query, [nemId], (err, rows) => {
        if (err) {
            throw err;
        }
        let codeFromDB = rows[0].Password;

        if (codeFromDB == nemIdCode) {
            return res.status(200).send('{"generatedCode": "' + generatedCode + '"}');
        } else {
            return res.status(403).send("Passwords not matching!");
        }
    });
});

app.listen(port);
console.log('Server started! POST to http://localhost:8090/nemid-auth');