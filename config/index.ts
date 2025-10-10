const config = {
  projectName: 'grainMpMix',
  date: '2025-10-5',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false }
  },
  mini: {
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      // 忽略 CSS 模块顺序警告 - 检查插件是否存在
      if (chain.plugins.has('mini-css-extract-plugin')) {
        chain.plugin('mini-css-extract-plugin').tap((args) => {
          if (!args[0]) {
            args[0] = {}
          }
          args[0].ignoreOrder = true
          return args
        })
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    // esnextModules: ['nutui-react'],
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
      },
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      // 忽略 CSS 模块顺序警告 - 检查插件是否存在
      if (chain.plugins.has('mini-css-extract-plugin')) {
        chain.plugin('mini-css-extract-plugin').tap((args) => {
          if (!args[0]) {
            args[0] = {}
          }
          args[0].ignoreOrder = true
          return args
        })
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
