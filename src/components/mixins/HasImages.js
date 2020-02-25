
const svgs = {};

const files = require.context('../../../assets/images/', true, /\.svg$/i);
files.keys().map(key => {
    const name = key.match(/\w+/)[0];
    const definition = files(key);
    svgs[name] = definition.default ? definition.default : definition;
});

export default {
    data() {
        return {
            svgs
        };
    }
}
