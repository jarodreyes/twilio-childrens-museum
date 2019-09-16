const fs = require('fs');
const request = require('request');
require('dotenv').load();
const twilio = require('twilio');
const soundDict = require('../lib/sound-dict.js');
const client = new twilio(process.env.TWILIO_DOITLIVE_SID, process.env.TWILIO_DOITLIVE_AUTH_TOKEN);
const testClient = new twilio(process.env.DOITLIVE_TEST_SID, process.env.DOITLIVE_TEST_AUTH_TOKEN);
const _ = require('underscore');
const fromNumber = '+14158775272'; //
const phoneNumbers = require("../lib/uniquePhoneNumbers.json");
// const phoneNumbers = require("./uniquePhoneNumbers-old.json");

// Object to update as we text audience
let colors = require('../lib/colors.js');
// Test object to store completed call sids in
let sids = [];

// Call the audience to kick off this party
// TODO: Update from number to production number
function testCallAudience () {
  try {
    phoneNumbers.forEach(function(entry, i) {
      let dictIndex = i % soundDict.length;
      let conf = soundDict[dictIndex].conference;
      testClient.calls.create({
        url: `https://jreyes.ngrok.io/joinconference&conf=${conf}`,
        fallbackUrl:soundDict[dictIndex].fallbackUrl,
        to: entry,
        from: '+15005550006'
      }).then(call => {
        sids.push(call.sid);
        console.log(call.sid);
      }).catch(err => console.log(`Twilio error from callAudience(): ${err}`))
    });
    setTimeout(function() {
      var myjson = JSON.stringify(sids);
      fs.writeFile("./lib/completedSids.json", myjson, (error) => {
        if(error) {
          return console.log(error);
        }
        console.log("file saved!");
      });
    }, 22000);
    return "Audience has been called!"
  } catch (e) {
    return console.log(`Error in callAudience: ${e}`);
  }
}

function callAudience () {
  try {
    phoneNumbers.forEach(function(entry, i) {
      let dictIndex = i % soundDict.length;
      let conf = soundDict[dictIndex].conference;
      client.calls.create({
        url: `https://okgo-demo.herokuapp.com/joinconference&conf=${conf}`,
        fallbackUrl:soundDict[dictIndex].fallbackUrl,
        to: entry,
        from: '+14158775272'
      }).then(call => {
        sids.push(call.sid);
        console.log(call.sid);
      }).catch(err => console.log(`Twilio error from callAudience(): ${err}`))
    });
    return "Audience has been called!"
  } catch (e) {
    return console.log(`Error in callAudience: ${e}`);
  }
}

function getNumbers() {
  return phoneNumbers;
}

function sendAudienceApp () {
  try {
    phoneNumbers.forEach(function(entry, i) {
      // Distribute number evenly
      let dictIndex = i % soundDict.length;
      let color = soundDict[dictIndex].color;

      // Send the audience a link to the app
      client.messages.create({
        body: `https://okgo-demo.herokuapp.com/okgo/${color}`,
        to: entry,
        messagingServiceSid: 'MG62dceaa8ab64695e07a0e3bc7108296d'
      }).then(call => {
        sids.push(call.sid);
        console.log(call.sid);
      }).catch(err => console.log(err))
    });
    return "Audience has been texted the app!"
  } catch (e) {
    return console.log(`Error in callAudience: ${e}`);
  }
}

function getAudienceNumbersFromKlik() {
  return "JSON generated from Klik"
}

function getAudienceNumbersFromTwilio() {
  var count = 0;
  var unique = [];
  console.log(`Getting numbers: ${fromNumber}`)
  var filterOpts = {
    to: fromNumber
  }
  client.messages.list(filterOpts, function(err, data) {
    // console.log(data);
    data.forEach(function(message) {
      var number = message.from;
      console.log("number ", number);
      var q = _.contains(unique, number);
      if (!q) {
        unique.push(number);
        console.log("in !q")
      }
      console.log("unique ", unique.length, unique)
    });
  }).then(function () {
    var myjson = JSON.stringify(unique);
    console.log("myjson ", myjson);
    fs.writeFile("./lib/uniquePhoneNumbers.json", myjson, (error) => {
      if(error) {
        return console.log(error);
      }
      console.log("file saved!");
    }); //writeFile
    return "generated JSON"
  }).catch(err => {
    console.log(err);
    return({success: false});
  });
  return "JSON generated from Twilio"
}

module.exports = {
  callAudience : callAudience,
  getNumbers : getNumbers,
  testCallAudience : testCallAudience,
  sendAudienceApp : sendAudienceApp,
  getAudienceNumbersFromTwilio: getAudienceNumbersFromTwilio
};