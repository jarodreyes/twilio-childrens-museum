const fs = require('fs');
const NounProject = require('the-noun-project');
const nounProject = new NounProject({
    key: process.env.NOUN_PROJECT_KEY,
    secret: process.env.NOUN_PROJECT_SECRET
});

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
  getNotes : getNotesFromDirectory,
  getIcon : getIconFromNote
};