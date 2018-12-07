// pages/commentEdit/commentEdit.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")
const app = getApp()

const recordManager = wx.getRecorderManager()  //调用录音实例
const innerAudioContext = wx.createInnerAudioContext()

var _animation
var _animationIntervalId
var i

Page({
  data: {
    userInfo: null,
    authType: 0,  //用户登录
    authRecord: true,  //录音权限
    type: "文字",  //编辑类型
    commentText: "",  //输入的文字
    movieDetail: {},  
    isPreview: false,
    // 录音按钮相关 以及 录音临时文件地址
    record: {
      text: "长按录音",
      iconPath: "https://icon-1258167024.cos.ap-guangzhou.myqcloud.com/record.png",
      tempFilePath: ""
    },
    commentRecord: "",  //录音文件地址
    animation: "",
    isPlay: false
  },
  onLoad: function (options) {
    //接受编辑影评的类型:文字or音频
    let editType = options.editType
    delete options.editType

    this.setData({
      type: editType,
      movieDetail: options
    })
  },
  onTapLogin() {
    app.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo: userInfo,
          authType: app.data.authType
        })
      },
      error: () => {
        this.setData({
          authType: app.data.authType
        })
      }
    })
  },
  isComment(callback) {
    //网络请求，返回某条评论详情和该用户对该电影的影评，若该用户对该电影的影评为空，则iscomment为false，用户进行编辑影评和发布影评
    let movie_id = this.data.movieDetail.id

    qcloud.request({
      url: config.service.commentUrl,
      login: true,
      data: {
        id: "",
        movie_id
      },
      success: res => {
        let data = res.data
        if (!data.code) {
          let isComment = data.data.userCommentDetail ? 1 : 0
          if(isComment) {
            wx.navigateBack()
            wx.showModal({
              title: '提示',
              content: '你已评论过该电影',
              showCancel: false
            })
          } else {
            callback && callback()
          }
        }
      },
      fail: res => {

      }
    })
  },
  onTapPreview() {
    //预览 按钮
    let isPreview = this.data.isPreview
    this.setData({
      isPreview: !isPreview
    })
  },
  onInput(event) {
    let commentText = event.detail.value

    this.setData({
      commentText
    })
  },
  checkRecordSetting() {
    //检查用户的录音权限
    wx.getSetting({
      success: res => {
        console.log(res.authSetting)
        let authRecord = res.authSetting["scope.record"]
        this.setData({
          authRecord
        })
      },
      fail: res => {

      }
    })
  },
  longTapRecord() {
    //长按录音时，检查录音权限，从而显示开启录音权限的按钮
    this.checkRecordSetting()
  },
  touchRecordStart() {
    //长按触发
    const options = {
      duration: 10000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    }
    //开始录音
    recordManager.start(options);
    recordManager.onStart(() => {
      wx.showLoading({
        title: '录音中...',
      })
      this.setData({
        record: {
          text: "松开结束录音",
          iconPath: "https://icon-1258167024.cos.ap-guangzhou.myqcloud.com/recording.png"
        }
      })
    })
    //错误回调
    recordManager.onError((res) => {
      console.log(res)
    })
  },
  touchRecordEnd() {
    //松开，长按结束，录音结束,直接跳转预览，并上传录音文件到对象存储桶record中
    recordManager.stop()
    recordManager.onStop( res => {
      wx.hideLoading()
      let tempFilePath = res.tempFilePath;
      console.log('停止录音', res)
      this.setData({
        record: {
          text: "长按录音",
          iconPath: "https://icon-1258167024.cos.ap-guangzhou.myqcloud.com/record.png",
          tempFilePath
        }
      })
      this.onTapPreview()
      this.uploadRecord()
    })
  },
  /**
   * 录音播放组件
   */
  onTapRecordPlay() {
    let isPlay = this.data.isPlay

    if (!isPlay) {
      this.startPlay()
    } else {
      this.stopPlay()
    }
  },
  startPlay() {
    innerAudioContext.loop = true
    innerAudioContext.src = this.data.record.tempFilePath,
    innerAudioContext.play()

    this.startAnimationInterval()  //旋转动画开始

    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError(res => {
      console.log('播放遇到错误')
    })

    //无论播放错误还是开始播放，都要改变播放状态
    this.setData({
      isPlay: true
    })
  },
  stopPlay() {
    innerAudioContext.stop()
    innerAudioContext.onStop(() => {
      console.log('停止播放')
    })

    this.stopAnimationInterval()  //停止旋转

    this.setData({
      isPlay: false
    })
  },
  onTapReEdit() {
    //重新编辑 按钮， 清空编辑内容
    this.stopPlay()
    this.setData({
      isPreview: false,
      commentext: "",
      record: {
        text: "长按录音",
        iconPath: "https://icon-1258167024.cos.ap-guangzhou.myqcloud.com/record.png",
        tempFilePath: ""
      }
    })
  },
  uploadRecord() {
    //上传录音文件
    let tempFilePath = this.data.record.tempFilePath

    const uploadTask = wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: tempFilePath,
      name: "file",
      success: res => {
        let data = JSON.parse(res.data)

        if (!data.code) {
          let commentRecord = data.data.imgUrl
          this.setData({
            commentRecord
          })
        }
      },
      fail: res => {

      }
    })

    uploadTask.onProgressUpdate(res => {
      if (res.progress === 100) {
        wx.showToast({
          title: '录音已上传',
        })
        uploadTask.offProgressUpdate()
      }
    })
  },
  onTapCommit(recordUrl) {
    // 上传影评,跳转该电影的影评列表
    this.stopPlay()
    let data = this.data

    let movieDetail = data.movieDetail
    let content = data.type === "文字" ? data.commentText : data.commentRecord

    if (!content) return

    wx.showLoading({
      title: '提交中...',
    })
    qcloud.request({
      url: config.service.commentUrl,
      login: true,
      method: "PUT",
      data: {
        id: movieDetail.id,
        content,
        type: data.type
      },
      success: res => {
        wx.hideLoading()
        let data = res.data
        console.log(res)
        if (!data.code) {
          wx.showToast({
            title: '发布成功！',
          })
          wx.navigateTo({
            url: `../commentList/commentList?movie_id=${movieDetail.id}&title=${movieDetail.title}&image=${movieDetail.image}`,
          })
        }
      },
      fail: res => {
        wx.hideLoading()
        //提交失败，重新编辑
        this.setData({
          isPreview: false
        })
      }
    })
  },
  onShow: function () {
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          authType: app.data.authType
        })
        console.log(userInfo)
        this.isComment()  //登陆后，检查是否已经评论
      }
    })
    _animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    })
  },
  //实现image旋转动画，每次旋转 120*n度
  rotateAni: function () {
    _animation.rotate(120 *(i)).step()
    i++
    console.log(i)
    this.setData({
      animation: _animation.export()
    })
  },
  //开始旋转
  startAnimationInterval: function () { 
    var that = this
    i = 1
    that.rotateAni()// 进行一次旋转
    _animationIntervalId = setInterval(function () {
      that.rotateAni()
    }, 500) // 每间隔_ANIMATION_TIME进行一次旋转
  },
  //停止旋转
  stopAnimationInterval: function () {
    console.log(_animationIntervalId)
    clearInterval(_animationIntervalId)
  },
  onHide: function () {
    this.stopPlay()
    recordManager.stop()
    recordManager.onStop(res => {
      console.log('onHide 停止录音')
    })
  },
  onUnload: function () {
    this.stopPlay()
    recordManager.stop()
    recordManager.onStop(res => {
      console.log('onHide 停止录音')
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})