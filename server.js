'use strict'
const bodyParser = require('body-parser');
const express = require('express');
const sassMiddleware = require('node-sass-middleware');
const fs = require('fs')
const path = require('path');
const _ = require('underscore');
const urllib = require('urllib');
const url = require('url');
const app = express();
// socket io
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const soundRouter = require('./routers/sound-router');
var request = require('request');
require('dotenv').load();
const baseURL = process.env.BASE_URL;
const getNotes = require('./operations/utilities').getNotes
const getIcon = require('./operations/utilities').getIcon

// configuring middleware
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));
// app.use(bodyParser.raw({ type: 'audio/x-wav'})); //vnd.wave
// app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'assets/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

io.on('connection', function (socket) {
    console.log('Socket connected')
    socket.on('trigger_sound', (msg) => {
      console.log(msg.action);
      io.emit('play_sound', msg);
      io.emit('start_song', msg);
    });

    socket.on('trigger_song', function (msg) {
        console.log(`Start: ${msg}`);
        io.emit('start_song', msg);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

const genreRoute = async (req, res) => {
  let notes = await getNotes(`./assets/audio/${req.params.name}/`);
  res.render('list', {notes: notes, genre: req.params.name});
}

const combinedRoute = async (req, res) => {
  let notes = await getNotes(`./assets/audio/${req.params.name}/`);
  res.render('combined', {notes: notes, genre: req.params.name})
}

const controlsRoute = async (req, res) => {
  let notes = await getNotes(`./assets/audio/${req.params.name}/`);
  res.render('controls', {notes: notes, genre: req.params.name})
}

const saveAudio = async (req, res) => {
  const file = req.body
  console.log(req.body)
  fs.writeFile('song.webm', file, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Song saved!');
  });
}

app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})

//serve up pad.html
app.get('/', function(req, res){
  res.render('home', {});
})
.post('/recordings', saveAudio)
.get('/controls/:name', controlsRoute)
.get('/genre/:name', genreRoute)
.get('/combined/:name', combinedRoute)
.get('/sound/:genre/:note', async function(req, res){
  let icons = await getIcon(req.params.note);
  res.render('phone-bell', {note: req.params.note, icons: icons, genre: req.params.genre});
})
.get('/trigger/:genre/:note', async function(req, res){
  let icons = await getIcon(req.params.note);
  res.render('touch-socket', {note: req.params.note, icons: icons, genre: req.params.genre});
});
app.use(express.static('assets')); //display background
// app.use(soundRouter);

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

http.listen(app.get('port'), function () {
    console.log(`NCM live on port: ${app.get('port')}`);
});
 
module.exports = {
  verbose: true,
  app : app,
  baseURL : baseURL,
  testEnvironment: 'node'
};
  