/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://dwppwasx.qcloud.la';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        //首页数据接口
        hotCommentUrl:`${host}/weapp/hot`,

        //电影列表接口
        movieUrl: `${host}/weapp/movie`,

        //评论获取、提交接口
        commentUrl: `${host}/weapp/comment`,

        //是否评论？
        isCommentUrl: `${host}/weapp/iscomment`,

        //收藏添加、获取接口
        favoriteUrl: `${host}/weapp/favorite`,

    }
};

module.exports = config;
