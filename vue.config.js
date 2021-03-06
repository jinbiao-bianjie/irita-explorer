const path = require('path');//引入path模块
function resolve(dir){
    return path.join(__dirname,dir)//path.join(__dirname)设置绝对路径
}

module.exports = {
    devServer: {
        proxy: {
          '/api':{
             	target:'http://localhost:3000',
            	secure:false,
            	pathRewrite:{'^/api': '/'}
          },
          '/lcd':{
              	target:'http://10.2.10.130:2317',
            	secure:false,
            	pathRewrite:{'^/lcd': '/'}
          }
        }
    },
    lintOnSave:false,
    chainWebpack:(config)=>{
        config.resolve.alias
        .set('@',resolve('./src'))
    },
    css: {
        loaderOptions: {
            'sass': {
                prependData: `@import "@/style/variable.scss";@import "@/style/productization.scss";`
            }
        }
    }
}
