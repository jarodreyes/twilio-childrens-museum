'use strict'
const bodyParser = require('body-parser');
const express = require('express');
const sassMiddleware = require('node-sass-middleware');
const fs = require('memfs');
const path = require('path');
const _ = require('underscore');
const urllib = require('urllib');
const url = require('url');
const app = express();
// socket io
const http = require('http').Server(app);
const io = require('socket.io')(http);
const secureRouter = require('./routers/secureRouter');
var request = require('request');
require('dotenv').load();
const baseURL = process.env.BASE_URL;
const getNotes = require('./operations/utilities').getNotes
const getIcon = require('./operations/utilities').getIcon
const uploadToS3 = require('./operations/utilities').uploadToS3
// For uploading
const multer  = require('multer') 
const upload = multer();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// configuring middleware
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));
// app.use(bodyParser.raw({ type: 'audio/x-wav'})); //vnd.wave
app.use(express.json());
app.set('view engine', 'ejs');
app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'assets/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

// streaming file

io.on('connection', function (socket) {
    console.log(`Socket ${socket.id} connected.`);

    socket.on('trigger_sound', (msg) => {
      console.log(msg.action);
      io.emit('play_sound', msg);
    });

    socket.on('trigger_song', function (msg) {
        console.log(`Start: ${msg.action}`);
        io.emit('start_song', msg);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('end_song', function () {
        console.log(`Ending song, showing loader`);
        io.emit('await_upload');
    });
    socket.on('reset_song', function () {
        console.log(`Resetting Song`);
        io.emit('reset_players');
    });

    socket.on('reset_phones', ()=> {
        io.emit('reload_window');
    })
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

const showNumberForm = async (req, res) => {
  res.render('form', {song: req.params.song})
}

const sendSongTwilio = async (req, res) => {
  console.log(req.body.phone);
  let songUrl = `https://ncm-audio-converted.s3.amazonaws.com/${req.params.song}.mp3`
  // let songUrl = 'https://ncm-audio-converted.s3.amazonaws.com/330e63d4-8a52-4bf1-8737-820ca6080274.mp3'
  twilio.messages.create({
    'to': '+12066505813',
    'from': process.env.TWILIO_NUMBER,
    'body': `Thank you for playing! Please enjoy the song your child recorded at: ${songUrl}`,
    'mediaUrl': songUrl
  }).then((message) => {
    console.log(message.sid);
    res.send('ok')
  });
}

app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})

const saveAudio = async (req, res, next) => {
  console.log(req.file.originalname); // see what got uploaded
  let fileBuffer = Buffer.from(new Uint8Array(req.file.buffer))
  let uploaded = await uploadToS3({
      fileBuffer: fileBuffer,
      fileName: req.file.originalname
  })
  console.log(`Upload: ${uploaded}`)
  io.emit('show_code', {file: req.file.originalname});
  res.sendStatus(200); //send back that everything went ok

}

app.use('/secure', secureRouter)
secureRouter.get('/play/:name', combinedRoute) 
secureRouter.get('/admin', async function(req, res){
  res.render('admin');
}) 

//serve up pad.html
app.get('/', function(req, res){
  res.render('home', {});
})
.post('/upload', upload.single('soundBlob'), saveAudio)
.get('/controls/:name', controlsRoute)
.get('/genre/:name', genreRoute)
.get('/combined/:name', combinedRoute)
.get('/sound/:genre/:note', async function(req, res){
  let icons = await getIcon(req.params.note);
  res.render('phone-bell', {note: req.params.note, icons: icons, genre: req.params.genre});
})
.get('/trigger/:genre/:note', async function(req, res){
  let icons = await getIcon(req.params.note);
  let camera = await getIcon('camera');
  res.render('touch-socket', {note: req.params.note, icons: icons, genre: req.params.genre, camera: camera});
})
.get('/send/:song', showNumberForm)
.post('/send/:song', sendSongTwilio);
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
  