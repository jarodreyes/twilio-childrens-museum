const fs = require('fs');
const NounProject = require('the-noun-project');
const nounProject = new NounProject({
    key: process.env.NOUN_PROJECT_KEY,
    secret: process.env.NOUN_PROJECT_SECRET
});
const awsBucket = process.env.AWS_NCM_BUCKET;

const s3 = require('s3');
 
const client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

const uploadToS3 = async (args) => {
    console.log(`ATTEMPTING UPLOAD TO S3: ${args.localFile}`)
    try {
        var params = {
            localFile: `${args.localFile}`,
            s3Params: {
                Bucket: awsBucket,
                Key: args.fileName,
            },
        };
        var uploader = client.uploadFile(params);
        uploader.on('error', function(err) {
            console.error("unable to upload:", err.stack);
            return false;
        });
        uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
        });
        uploader.on('end', function() {
            console.log("done uploading");
            return true;
        });
    } catch(e) {
        // statements
        console.log(e);
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
    getIcon : getIconFromNote
};