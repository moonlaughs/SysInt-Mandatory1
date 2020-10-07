const csv = require('csv-parser');
const fs = require('fs');

var builder = require('xmlbuilder');

const express = require('express');
const axios = require('axios');

var app = express();

var FirstName;
var LastName;
var DateOfBirth;
var Email;

var array = [];//[{firstName:"m1", lastname: "row.LastName", cprnumber: "row.DateOfBirth", email: "row.Email"}]
function Person(firstname, lastname, dateofbirth, email)
{
    this.FirstName = firstname;
    this.LastName = lastname;
    this.DateOfBirth = dateofbirth;
    this.Email = email;
}
var i = 0;
fs.createReadStream('../Main_System/people.csv')
    .pipe(csv())
    .on('data', (row) => {
        //console.log(row.FirstName);
        array.push(new Person(row.FirstName, row.LastName, row.DateOfBirth, row.Email));
        console.log(array[i].FirstName)
        generateXml(array[i]);
        i++;
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

function generateXml(data) {
    console.log("My" + data.FirstName)
    var root = builder.create('Person')
    var item = root.ele('FirstName', {}, data.FirstName);
    var item2 = root.ele('LastName', {}, data.LastName);
    var item3 = root.ele('CprNumber', {}, generateCpr(data.DateOfBirth));
    var item4 = root.ele('Email', {}, data.Email);
    var xml = root.end({ pretty: true });
    console.log(xml);
    sendPost(xml);
}

function generateCpr(dateOfBirth) {
    var dob = dateOfBirth.split("-");
    var cpr = dob[0] + dob[1] + dob[2] + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
    return cpr.toString();
}

function sendPost(body) {
    
    axios.post('http://localhost:8080/nemID', body).then(response =>{
        console.log(response)
        return res.status(200).send({generatedCode: response.data.generatedCode});
    }).catch(err =>{
        if(err){
            console.log(err);
        }
    });
}