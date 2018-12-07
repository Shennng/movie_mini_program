const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wxeba7546549347f3b',

    // 微信小程序 App Secret
    appSecret: '',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,

    qcloudAppId: '1258167024',
    qcloudSecretId: 'AKIDfWg6WZnoLhG0t2cBVvVBxtxPvgbjkHzp',
    qcloudSecretKey: 'LpbVhyqxAOy8Pspr9V5hQE78IVqFgMD9',

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: 'wxeba7546549347f3b',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'record',
        // 文件夹
        uploadFolder: '',
        //上传文件类型
        mimetypes: ["image/jpeg", "video/mp3", "video/aac", "image/png"]
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

module.exports = CONF
