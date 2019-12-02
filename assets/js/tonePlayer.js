class TonePlayer {
    constructor(notes) {
        this.notes = {}
        for (var i=0; i<notes.length; i++) {
            this.notes[notes[i]] = `/audio/${genre}/${notes[i]}.mp3`
        };
        this.players = new Tone.Players(this.notes);
        for (var i=0; i<notes.length; i++) {
            let p = this.players.get(notes[i]);
            p.mute = true;
            p.loop = true;
            p.fadeIn = '8n';
            p.sync().start(0);
        };
        console.log(this.players);
        this.players.toMaster();
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