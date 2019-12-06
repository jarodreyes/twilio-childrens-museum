const fs = require('fs');
const idealNotes = require('../lib/notes.json')
const NounProject = require('the-noun-project');
const nounProject = new NounProject({
    key: process.env.NOUN_PROJECT_KEY,
    secret: process.env.NOUN_PROJECT_SECRET
});
const awsBucket = process.env.AWS_NCM_BUCKET;

const AWS = require('aws-sdk');
 
var client = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET
});

const uploadToS3 = async (args) => {
    // console.log(`ATTEMPTING UPLOAD TO S3: ${args.fileBuffer}`)
    try {
         var params = {
              Body: args.fileBuffer, 
              Bucket: awsBucket, 
              Key: args.fileName,
              ContentType: 'audio/webm'
             };
             client.putObject(params, function(err, data) {
               if (err) console.log(err, err.stack); // an error occurred
               else console.log(data);           // successful responses
             });
    } catch(e) {
        // statements
        console.log(`ERROR: ${e}`);
    }
    
}

// Get list of available notes from asset folder
const getNotesFromDirectory = (dir) => {
  return new Promise((resolve, reject) => {
      const notes = [];
      try {
         
        if (dir.length <= 2) {
            console.log("Usage: " + __filename + " path/to/directory");
        }
         
        var path = dir;
         
        fs.readdir(path, function(err, items) {
            console.log(items);
         
            for (var i=0; i<items.length; i++) {
                let note = (items[i]).slice(0, -4);
                console.log(note);
                notes.push(note);
            }
            resolve(notes);
        });
      } catch (e) {
        reject(e);
      }
  });
}


// Get list of available notes from asset folder
const getNoteFromPosition = (genre, position) => {
  return new Promise((resolve, reject) => {
      try {
        let pos = parseInt(position) - 1;
        let note = idealNotes[genre.toLowerCase()][pos];
        resolve(note)
      } catch (e) {
        reject(e);
      }
  });
}


const getIconsFromApi = (word) => {
    return new Promise((resolve, reject) => {
        nounProject.getIconsByTerm(word, {limit: 5}, function (err, data) {
            if (!err) {
                resolve(data.icons[0].preview_url);
            } else {
                console.log(`Error message ${err}`);
                reject(err);
            }
        });
    });
}


const getIconFromNote = async (note) => {
    let sections = note.split('_');
    let icons = [];
    for (let i = 0; i < sections.length; i++) {
        let icon = await getIconsFromApi(sections[i]).catch((err) => { console.error(err); });
        if (icon != undefined) {icons.push(icon)};
    }
    
    return icons;
}

module.exports = {
    uploadToS3: uploadToS3,
    getNotes : getNotesFromDirectory,
    getIcon : getIconFromNote,
    getNotePosition: getNoteFromPosition
};