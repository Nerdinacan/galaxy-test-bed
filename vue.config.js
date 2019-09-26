const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir)
}

const env = process.env.NODE_ENV;

module.exports = {
    lintOnSave: false,
    configureWebpack: {
        devtool: 'inline-source-map'
    },
    chainWebpack: config => {

        config.resolve.modules
            .prepend(resolve('src'));

        const cachePath = "components/History/model/caching";

        config.resolve.alias
            .set('scss', resolve('style/'))
            .set('theme', resolve('style/theme/'))
            .set(`${cachePath}/config`, `${cachePath}/config/${env}.config.js`);

        const babelOptions = {
            ignore: [
                "i18n.js",
                "utils/localization.js",
                "nls/*"
            ],
            plugins: []
        }

        // Add rewire in test mode only
        if (env == "test") {
            babelOptions.plugins.push("rewire");
        }

        config.module.rule('js')
            .use('babel-loader')
            .loader('babel-loader')
            .options(babelOptions)
    }
}
