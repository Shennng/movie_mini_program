//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

const UNPROMPTED = 0  //未弹窗
const UNAUTHORIZED = 1  //未授权,拒绝授权
const AUTHORIZED = 2  //已授权

App({
  userInfo: null,
  data: {
    authType: UNPROMPTED
  },
  onLaunch() {
    qcloud.setLoginUrl(config.service.loginUrl)
  },
  checkSession({ success, error }) {

    wx.checkSession({
      success: () => {
        this.getUserInfo({ success, error })
      },
      fail: () => {
        error && error()
      }
    })
  },
  login({ success, error }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting["scope.userInfo"] === false) {
          this.data.authType = UNAUTHORIZED
          // 已拒绝授权，则
          wx.showModal({
            title: "提示",
            content: "请授权我们获取您的用户信息",
            showCancel: false
          })
          error && error()
        } else {
          this.data.authType = AUTHORIZED
          this.doQcloudLogin({ success, error })
        }
      }
    })
  },
  doQcloudLogin({ success, error }) {
    qcloud.login({
      success: res => {
        if (res) {
          let userInfo = res
          this.userInfo = userInfo
          success && success({ userInfo })
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          this.getUserInfo({ success, error })
        }
      },
      fail: () => {
        error && error()
      }
    })
  },
  getUserInfo({ success, error }) {
    let userInfo = this.userInfo
    if (this.userInfo) {
      return (success && success({ userInfo }))
    }
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success: res => {
        let data = res.data
        if (!data.code) {
          let userInfo = data.data
          this.userInfo = userInfo
          this.data.authType = AUTHORIZED
          success && success({ userInfo })
        } else {
          error && error()
        }
      },
      fail: res => {
        error && error()
      }
    })
  },
})