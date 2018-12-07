// pages/commentDetail/commentDetail.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")
const app = getApp()

//播放器实例
const innerAudioContext = wx.createInnerAudioContext()

//点击播放所展现的图片旋转动画相关变量
var _animation //动画实例
var _animationIntervalId  //循环的唯一ID，用于停止循环clearInterval
var i //动画旋转递增指数index

Page({
  data: {
    userInfo: null,
    authType: 0,
    movieDetail: {},
    actionSheetHidden: true,
    actionSheetItems: ['文字', '音频'],
    commentDetail: {},
    userCommentDetail: null,
    isPlay: false
  },
  onLoad: function (options) {
    /**
     * 接受其他页面传入的影评唯一id,以及电影详情movieDetail：{movie_id, title, image}
     * 网络请求获取影评详情commentDetail
     */
    let id = options.id
    delete options.id 
    console.log("commentDetail movieDetail",options)
    this.setData({
      movieDetail: options,
      commentDetail: {id}
    })
    this.getCommentDetail()
  },
  onTapLogin() {
    //用户需要登录才能查看影评详情
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
  /**
   * 上浮菜单相关
   */
  actionSheetTap(event) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetChange(event) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindItemTap(event) {
    let editType = event.currentTarget.dataset.name
    let movieDetail = this.data.movieDetail

    wx.navigateTo({
      url: `../commentEdit/commentEdit?editType=${editType}&id=${movieDetail.id}&title=${movieDetail.title}&image=${movieDetail.image}`,
    })

    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  getCommentDetail(callback) {
    /**
     * 网络请求影评详情，返回数据包括commentDetail(当前影评详情)和userCommentDetail(当前用户对该电影的评论)
     * 返回userCommentDetail主要是为了用户点击“看我的”这个按钮，可以切换为当前用户自己的评论
     */
    let id = this.data.commentDetail.id
    let movie_id = this.data.movieDetail.movie_id

    qcloud.request({
      url: config.service.commentUrl,
      login: true,
      data: {
        id,
        movie_id
      },
      success: res => {
        let data = res.data
        console.log(data.data)
        if (!data.code) {
          this.setData({
            userCommentDetail: data.data.userCommentDetail || null,
            commentDetail: data.data.commentDetail
          })
        }
      },
      fail: res => {
        console.log("getCommentDetail fail")
        console.log(res)
      }
    })
  },
  onTapToMe(event) {
    //切换到 看我的 即我对该电影的影评，也要停止录音播放
    let userCommentDetail = this.data.userCommentDetail
    this.stopPlay()
    this.setData({
      commentDetail: userCommentDetail
    })
    wx.showToast({
      title: '这是您的哦~',
    })
  },
  onTapAddMyFavorites(event) {
    // 添加到我的收藏
    let comment_id = event.currentTarget.dataset.id

    wx.showLoading({
      title: '收藏中...',
    })
    qcloud.request({
      url: config.service.favoriteUrl,
      login: true,
      method: "PUT",
      data: {
        id: comment_id
      },
      success: res => {
        wx.hideLoading()
        let data = res.data
        console.log(data)
        if(!data.code) {
          let isExisted = data.data.isExisted
          if (isExisted) {
            wx.showToast({
              icon: "none",
              title: '请勿重复收藏',
            })
          } else {
            wx.showToast({
              title: '收藏成功！',
            }) 
          }
        } else {
          wx.showToast({
            icon: "none",
            title: '收藏失败，请重试',
          }) 
        }
      },
      fail: res => {
        wx.hideLoading()
        wx.showToast({
          icon: "none",
          title: '收藏失败，请重试',
        })
        console.log("onTapAddMyFavorites fail")
        console.log(res)
      }
    })
  },
  /**
   * 录音播放组件
   */
  onTapRecordPlay() {
    let data = this.data
    let isPlay = data.isPlay
    let currentRecord = data.commentDetail.content
    console.log("isPlay" + isPlay)
    if (!isPlay) {
      this.startPlay(currentRecord)
    } else {
      this.stopPlay()
    }
  },
  startPlay(currentRecord) {
    innerAudioContext.loop = true
    innerAudioContext.src = currentRecord
    innerAudioContext.play()
    this.startAnimationInterval()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError(res => {
      console.log('播放遇到错误')
    })
    this.setData({
      isPlay: true
    })
  },
  stopPlay() {
    innerAudioContext.stop()
    innerAudioContext.onStop(() => {
      console.log('停止播放')
    })
    this.stopAnimationInterval()
    this.setData({
      isPlay: false
    })
  },
  onShow: function () {
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          authType: app.data.authType
        })
      }
    })

    _animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    })
  },
  /**
    * 实现image旋转动画，每次旋转 120*n度
    */
  rotateAni: function () {
    i++
    console.log(i)
    _animation.rotate(120 * (i)).step()
    this.setData({
      animation: _animation.export()
    })
  },
  //开始旋转
  startAnimationInterval: function () {
    var that = this
    i = 0
    that.rotateAni()// 进行一次旋转
    _animationIntervalId = setInterval(function () {
      that.rotateAni()
    }, 500) // 每间隔_ANIMATION_TIME进行一次旋转
  },
  //停止旋转
  stopAnimationInterval: function () {
    clearInterval(_animationIntervalId)
  },
  onHide: function () {
    //页面隐藏，需要停止正在播放的录音
    this.stopPlay()
    console.log("onHide 播放停止")
  },
  onUnload: function () {
    //页面卸载，需要停止正在播放的录音
    this.stopPlay()
    console.log("onUnload 播放停止")
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})