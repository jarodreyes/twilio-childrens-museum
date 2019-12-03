class Recorder {
    constructor(socket, Tone, songLength) {
        // defaults
        console.log('Recorder created')
        this.songLength = songLength;
        this.socket = socket;
        this.sent = '';
        //set the transport

        this.chunks = [];
        this.actx = Tone.context;
        this.dest  = this.actx.createMediaStreamDestination();
        this.recorder = new MediaRecorder(this.dest.stream);

        this.recorder.ondataavailable = evt => {
            this.chunks.push(evt.data);
        }
        
        this.recorder.onstop = async (evt) => {
            console.log(`Saving recording ${evt.target.stream.id}`)
            this.socket.emit('end_song');
            this.blob = new Blob(this.chunks, { type: 'audio/webm' });
            this.sent = await this.sendAudio(this.blob, evt.target.stream.id);
        };
    }

    start() {
        this.recorder.start();
        setTimeout(() => {
          this.recorder.stop();
        }, this.songLength);
        return true;
    }

    getStream() {
        return this.dest;
    }

    stop() {
        delete this.dest
        delete this.recorder
    }

    sendAudio = async(blob, id) => {
        // TODO Before we send convert to mp3 or .wav?
        let formdata = new FormData();
        formdata.append('soundBlob', blob, `${id}.webm`);
        return $.ajax({
            type: "POST",
            url: '/upload',
            enctype: 'multipart/form-data',
            data: formdata,
            success: this.success,
            cache: false,
            contentType: false,
            processData: false
        });

    }

    success = (data) => {
        console.log(data);
        console.log('successfully sent recording!')
    }
}