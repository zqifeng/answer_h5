let APP_SERVER_URL = ""

if(process.env.NODE_ENV === 'development'){
    // 开发环境
     APP_SERVER_URL = 'http://muwarriors.12par.cn:5000'
}else{
    // 生产环境
     APP_SERVER_URL = 'http://muwarriors.12par.cn:5000'
}

export default APP_SERVER_URL
