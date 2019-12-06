class TonePlayer {
    // var piano = new Tone.Sampler({
    //     "A0" : "A0.[mp3|ogg]",
    //     "C1" : "C1.[mp3|ogg]",
    //     "D#1" : "Ds1.[mp3|ogg]",
    //     "F#1" : "Fs1.[mp3|ogg]",
    //     "A1" : "A1.[mp3|ogg]",
    //     "C2" : "C2.[mp3|ogg]",
    //     "D#2" : "Ds2.[mp3|ogg]",
    //     "F#2" : "Fs2.[mp3|ogg]",
    //     "A2" : "A2.[mp3|ogg]",
    //     "C3" : "C3.[mp3|ogg]",
    //     "D#3" : "Ds3.[mp3|ogg]",
    //     "F#3" : "Fs3.[mp3|ogg]",
    //     "A3" : "A3.[mp3|ogg]",
    //     "C4" : "C4.[mp3|ogg]",
    //     "D#4" : "Ds4.[mp3|ogg]",
    //     "F#4" : "Fs4.[mp3|ogg]",
    //     "A4" : "A4.[mp3|ogg]",
    //     "C5" : "C5.[mp3|ogg]",
    //     "D#5" : "Ds5.[mp3|ogg]",
    //     "F#5" : "Fs5.[mp3|ogg]",
    //     "A5" : "A5.[mp3|ogg]",
    //     "C6" : "C6.[mp3|ogg]",
    //     "D#6" : "Ds6.[mp3|ogg]",
    //     "F#6" : "Fs6.[mp3|ogg]",
    //     "A6" : "A6.[mp3|ogg]",
    //     "C7" : "C7.[mp3|ogg]",
    //     "D#7" : "Ds7.[mp3|ogg]",
    //     "F#7" : "Fs7.[mp3|ogg]",
    //     "A7" : "A7.[mp3|ogg]",
    //     "C8" : "C8.[mp3|ogg]"
    // }, {
    //     "release" : 1,
    //     "baseUrl" : "./audio/salamander/"
    // }).toMaster();
    constructor(notes, sampler) {
        this.notes = {}
        for (var i=0; i<notes.length; i++) {
            this.notes[notes[i]] = `/audio/${genre}/${notes[i]}.mp3`
        };
        this.players = new Tone.Players(this.notes);
        for (var i=0; i<notes.length; i++) {
            let p = this.players.get(notes[i]);
            p.mute = true;
            p.loop = true;
            p.sync().start(0);
        };
        console.log(this.players);
        this.players.toMaster();
    }

    resetSong = async() => {
        console.log('RESETTING SONG!')
        let promises = []
        const keys = Object.keys(this.notes);
        for (const key of keys) {
            promises.push(
                new Promise((resolve, reject) => {
                    console.log(console.log(`resolving ${key}`))
                    resolve(this.stopNote(key))
                })
            )
        }

        return Promise.all(promises)
    }


    connectStream = async(stream) => {
        return this.players.connect(stream);
    }

    disconnectStream = async(stream) => {
        return this.players.disconnect(stream);
    }

    playNote(note) {
        let n = this.players.get(note);
        n.mute = false;
    }

    stopNote(note) {
        let n = this.players.get(note);
        n.mute = true;
    }
}