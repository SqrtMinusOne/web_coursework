interface Clip {
    path: string,
    buffer: any,
    loaded: boolean,
    play: (volume, loop: boolean)=>void
}

export class SoundManager{
    private clips: {[path: string] : Clip};
    private context: AudioContext;
    private gainNode: AudioNode;
    private loaded: boolean;
    constructor(){
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.clips = {};
    }
    load(path: string, callback?){
        if (this.clips[path]){
            callback(this.clips[path]);
            return
        }
        let clip = {
            path: path,
            buffer: null,
            loaded: false,
            play: function (volume, loop) {
                this.play(this.path, {looping: loop ? loop: false, volume: volume ? volume : 1})
            }.bind(this)
        };
        this.clips[path] = clip;
        let request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            this.context.decodeAudioData(request.response, function (buffer){
                clip.buffer = buffer;
                clip.loaded = true;
                if (callback)
                    callback(clip);
            });

        }.bind(this);
        request.send();
    }
    loadArray(array: string[]){
        for (let i = 0; i < array.length; i++) {
            this.load(array[i], function () {
                if (array.length === Object.keys(this.clips).length){
                    for (let sd in this.clips)
                        if (!this.clips[sd].loaded) return;
                    this.loaded = true;
                }
            }.bind(this))
        }
    }
    play(path, settings?){
        if (!this.loaded){
            setTimeout(()=>{this.play(path, settings)}, 1000);
            return;
        }
        let looping = false; let volume = 1;
        if (settings){
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }
        let sd = this.clips[path];
        if (!sd)
            return false;
        let sound = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        // @ts-ignore
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }
}