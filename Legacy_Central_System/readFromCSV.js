const csv = require('csv-parser');
const fs = require('fs');

var builder = require('xmlbuilder');

const msgpack = require('msgpack-lite');

var request = require('request');

var FirstName;
var LastName;
var DateOfBirth;
var Email;
var CprNumber;
var Address;
var Country;
var Phone;
var NemId;

function thisPerson(firstname, lastname, dob, email, cpr, address, country, phone, nemid) {
    this.FirstName = firstname;
    this.LastName = lastname;
    this.DateOfBirth = dob;
    this.Email = email;
    this.CprNumber = cpr;
    this.Address = address;
    this.Country = country;
    this.Phone = phone;
    this.NemId = nemid;
}

fs.createReadStream('../Main_System/people.csv')
    .pipe(csv())
    .on('data', (row) => {
        console.log("Reading data from csv file...")
        generateXml(new thisPerson(row.FirstName, row.LastName, row.DateOfBirth, row.Email, generateCpr(row.DateOfBirth), row.Phone, row.Addrss, row.Country))
    })
    .on('end', () => {
        console.log('Process successfully processed');
    });

function generateXml(personData) {
    console.log("Generating XML...")
    var person = builder.create('Person')
    var firstname = person.ele('FirstName', {}, personData.FirstName);
    var lastname = person.ele('LastName', {}, personData.LastName);
    var cprnumber = person.ele('CprNumber', {}, personData.CprNumber);
    var email = person.ele('Email', {}, personData.Email);
    var xml = person.end({ pretty: true });

    sendPost(xml, personData);
}

function generateCpr(dateOfBirth) {
    console.log("Generating cpr...")
    var dob = dateOfBirth.split("-");
    var cpr = dob[0] + dob[1] + dob[2] + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
    return cpr.toString();
}

function sendPost(body, personData) {
    console.log("preparing for sending request...")

    request.post({
        headers: { 'content-type': 'text/xml' }
        , url: 'http://localhost:8080/nemID', body: body
    }
        , function (error, response, body) {
            console.log(request.Response) //not fully working

            var nemidClean = body.replace('\"}','');

            var jsonObject = {
                "f_name": personData.FirstName,
                "l_name": personData.LastName,
                "birth_date": personData.DateOfBirth,
                "email": personData.Email,
                "country": personData.Country,
                "phone": personData.Phone,
                "address": personData.Address,
                "CPR": personData.CprNumber,
                "NemID": nemidClean.replace('{\"nemID\":\"','')
            }
            var serializedObject = JSON.stringify(jsonObject);

            var writeStream = fs.createWriteStream(`${jsonObject.CPR}.msgpack`);
            var encodeStream = msgpack.createEncodeStream();
            encodeStream.pipe(writeStream);
            encodeStream.write(serializedObject);
            encodeStream.end();

        });
}
