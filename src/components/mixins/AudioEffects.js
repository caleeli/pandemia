function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        const promise =  new Promise((resolve) => {
            this.sound.currentTime = 0;
            this.sound.play();
            this.sound.onended = function () {
                resolve(this.sound);
            };
        });
        promise.sound = this.sound;
        return promise;
    }
    this.stop = function () {
        this.sound.pause();
    }
}

const effects = {};

const files = require.context('../../../assets/sounds/', true, /\.mp3$/i);
files.keys().map(key => {
    const name = key.match(/\w+/)[0];
    const definition = files(key);
    effects[name] = new Sound(definition.default ? definition.default : definition);
});

export default {
    methods: {
        volume() {

        },
        audio(audioId) {
            return effects[audioId] ? effects[audioId].play() : null;
        },
        randomAudio(audioId, value) {
            return Math.random() * (100 - value) < 1 ? this.audio(audioId) : { then() { } };
        }
    }
}
