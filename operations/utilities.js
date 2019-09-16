const fs = require('fs');
const NounProject = require('the-noun-project');
const notes = [];

// Get list of available notes from asset folder
const getNotesFromDirectory = (dir) => {
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
    });
    return notes;
  } catch (e) {
    return console.log(`Error in getNotes: ${e}`);
  }
}

const nounProject = new NounProject({
    key: process.env.NOUN_PROJECT_KEY,
    secret: process.env.NOUN_PROJECT_SECRET
});

const getIconsFromApi = (word) => {
    return new Promise((resolve, reject) => {
        nounProject.getIconsByTerm(word, {limit: 5}, function (err, data) {
            if (!err) {
                console.log(data.icons[0].preview_url);
                resolve(data.icons[0].preview_url);
            } else {
                reject(err);
            }
        });
    });
}


const getIconFromNote = async (note) => {
    let sections = note.split(' ');
    let icons = [];
    for (let i = 0; i < sections.length; i++) {
        let icon = await getIconsFromApi(sections[i]).catch((err) => { console.error(err); });
        if (icon != undefined) {icons.push(icon)};
    }
    
    return icons;
}

module.exports = {
  getNotes : getNotesFromDirectory,
  getIcon : getIconFromNote
};