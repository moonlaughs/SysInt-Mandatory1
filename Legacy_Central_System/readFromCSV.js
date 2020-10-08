const csv = require('csv-parser');
const fs = require('fs');

var builder = require('xmlbuilder');

//const express = require('express');
const axios = require('axios');

const msgpack = require('msgpack-lite');

//var app = express();

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
    var root = builder.create('Person')
    var item = root.ele('FirstName', {}, personData.FirstName);
    var item2 = root.ele('LastName', {}, personData.LastName);
    var item3 = root.ele('CprNumber', {}, personData.CprNumber);
    var item4 = root.ele('Email', {}, personData.Email);
    var xml = root.end({ pretty: true });
    console.log(xml);
    sendPost(xml, personData);
}

function generateCpr(dateOfBirth) {
    console.log("Generating cpr...")
    var dob = dateOfBirth.split("-");
    var cpr = dob[0] + dob[1] + dob[2] + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
    return cpr.toString();
}

function sendPost(body, personData) {
    console.log("preparing for snding request...")

    axios.post('http://localhost:8080/nemID', body).then(response => {
        console.log(response)
        var jsonObject = {
            "f_name": personData.FirstName,
            "l_name": personData.LastName,
            "birth_date": personData.DateOfBirth,
            "email": personData.Email,
            "country": personData.Country,
            "phone": personData.Phone,
            "address": personData.Address,
            "CPR": personData.CprNumber,
            "NemID": response.nemID
        }
        var serializedObject = JSON.stringify(jsonObject);

        var writeStream = fs.createWriteStream(`${jsonObject.CPR}.msgpack`);
        var encodeStream = msgpack.createEncodeStream();
        encodeStream.pipe(writeStream);
        encodeStream.write(serializedObject);
        encodeStream.end();


        return res.status(200).send({ generatedCode: response.data.generatedCode }); //not sure...
    }).catch(err => {
        if (err) {
            console.log(err);
        }
    });
}