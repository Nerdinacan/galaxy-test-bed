const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    lintOnSave: false,
    configureWebpack: {
        devtool: 'source-map'
    },
    chainWebpack: config => {

        config.resolve.modules
            .prepend(resolve('src'));

        config.resolve.alias
            .set('scss', resolve('style/'))
            .set('theme', resolve('style/theme/'))

        config.module.rule('js')
            .use('babel-loader')
            .set('options', {
                ignore: [
                    "i18n.js",
                    "utils/localization.js",
                    "nls/*"
                ]
            })
    }
}
