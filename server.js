'use strict'
const bodyParser = require('body-parser');
const express = require('express');
const sassMiddleware = require('node-sass-middleware');
const http = require('http');
const fs = require('fs')
const path = require('path');
const _ = require('underscore');
const urllib = require('urllib');
const url = require('url');
const app = express();
const twilio = require('twilio');
const soundRouter = require('./routers/sound-router');
var request = require('request');
const soundDict = require('./lib/sound-dict.js')
require('dotenv').load();
const client = require('twilio')(process.env.TWILIO_DOITLIVE_SID, process.env.TWILIO_DOITLIVE_AUTH_TOKEN);
const fromNumber = "+14153635682";
const toNumber = process.env.OKGO_CONF_NUMBER;
const baseURL = process.env.BASE_URL;
const getNotes = require('./operations/utilities').getNotes
const getIcon = require('./operations/utilities').getIcon
// var router = express.Router();
function randomIntFromInterval(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}
// configuring middleware
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw({ type: 'audio/x-wav'})); //vnd.wave
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'assets/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.post('/joinconference', (req, res) => {
  let conference,
    twiml = new twilio.twiml.VoiceResponse();
  if (req.query.conf) {
    conference = req.query.conf;
  } else { 
    let minConference = _.min(soundDict, (obj) => {
      return obj.num;
    })
    minConference.num += 1;
    conference = minConference.conference
  }
  console.log(`/////////////////////////////// CALLER JOINED -------------------------->> ${conference}.`); 

  twiml.say(`Get ready to be amazed by Okay Go. Welcome to the show!`, {voice: 'alice'});
  let dial = twiml.dial();
  let muted = !(req.body.From == "client:okgo");
  dial.conference(conference, {
    startConferenceOnEnter: true, //run once
    beep: false,
    muted: muted //yolo
  });
  res.type('text/xml').send(twiml.toString());
});

const colors = {
  green: ["g_flat_4","b_flat_4","g_5"],
  red: ["a_flat_4","e_flat_5","f_5"],
  orange: ["e_flat_4","a_4","b_flat_5"],
  blue: ["g_4","d_5","a_5",],
  yellow: ["f_4","c_5","g_flat_5"]
}

//serve up pad.html
app.get('/', function(req, res){
  let notes = getNotes('./assets/audio/');
  res.render('list', {notes: notes});
}).get('/wand', function(req, res){
  res.sendFile('assets/wand.html', { root : __dirname});
}).get('/bell/:note', async function(req, res){
  console.log(req.params.note);
  let icons = await getIcon(req.params.note);
  console.log(icons);
  res.render('phone-bell', {note: req.params.note, icons: icons});
}).get('/touch/:note', function(req, res){
  console.log(req.params.note);
  res.render('touch-bell', {note: req.params.note});
}).get('/okgo/:color', function(req, res){
  let notes = colors[req.params.color];
  res.render('okgo-live', {notes: notes, color: req.params.color});
}).get('/client', function(req, res){
  res.sendFile('assets/client-test.html', { root : __dirname});
}).get('/admin/call', function(req, res) {
  let result = callAudience()
  res.send(result);
}).get('/test/call', function(req, res) {
  let result = testCallAudience()
  res.send(result);
}).get('/admin/sms', function(req, res) {
  let result = sendAudienceApp()
  res.send(result);
}).get('/admin/get-numbers', function(req, res) {
  let result = getAudienceNumbersFromTwilio();
  res.send(result);
}).get('/admin/numbers', function(req, res) {
  let result = getNumbers();
  res.send(result);
});
app.use(express.static('assets')); //display background
app.use(soundRouter);


// Cleanup
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
// process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

// start server
var server = ''
if (!module.parent) {
  server = app.listen(app.get('port'), () => console.log('started server'));
}
// exports.listen = function () {
//   this.server.listen.apply(this.server, arguments);
// };

// exports.close = function (callback) {
//   this.server.close(callback);
// };
 
module.exports = {
  verbose: true,
  server : server,
  app : app,
  baseURL : baseURL,
  client: client,
  testEnvironment: 'node'
};
  