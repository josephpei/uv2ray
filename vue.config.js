const path = require('path')

module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  chainWebpack: config => {
    config
      .entry('app')
      .clear()
      .add('./src/render/main.js')
      .end()
    config.resolve.alias.set('@', path.join(__dirname, './src/render'))
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        files: [
          {
            filter: ['**/*'],
          },
        ],
        asar: true,
      },
      mainProcessFile: 'src/main/index.js',
      mainProcessWatch: ['src/main'],
    },
  },
  // productionSourceMap: false,
}
