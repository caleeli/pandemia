const colors = {
    red: [208, 52, 77],
    blue: [80, 227, 194],
};

export default function (feature, property, object, addReturn = false) {
    const res = {};
    const functions = {};
    const fns = [];
    for (let m in object) {
        functions[feature + "_" + m] = object[m];
        fns.push(feature + "_" + m);
    }
    const keys = Object.keys(object);
    res[feature] = function (action) {
        const funcs = [];
        fns.forEach(fn => funcs.push(this[fn]));
        return new Function(
            "action",
            "audio",
            "randomAudio",
            "volume",
            ...Object.keys(colors),
            ...keys,
            (addReturn ? "return " : "") + action.attributes[property]
        ).call(this, action.attributes, this.audio, this.randomAudio, this.volume, ...Object.values(colors), ...funcs);
    };
    return Object.assign(res, functions);
}
