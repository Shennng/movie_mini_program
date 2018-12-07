// pages/user/user.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()

var _animation
var _animationIntervalId
var i

Page({
  data: {
    userInfo: null,
    authType: 0,
    animation: "",
    myFavorites: [],
    myComments: [],
    isShowingMyComments: false,
    isShowingMyFavorites: false,
    isPlayMapForMyComments: [], //是否录音在播放，myComments和myFavorites的ID可能会重复，所以分成两个Map
    isPlayMapForMyFavorites: [] 
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
  onTapShowMyComments() {
    let isShowingMyComments = this.data.isShowingMyComments
    this.setData({
      isShowingMyComments: !isShowingMyComments
    })

    if (isShowingMyComments) return
    console.log("正在getMyComments")
    let user = this.data.userInfo.openId
    wx.showLoading({
      title: '加载中...',
    })
    qcloud.request({
      url: config.service.commentUrl + user,
      success: res => {
        wx.hideLoading()
        let data = res.data

        if (!data.code) {
          let myComments = data.data
          myComments.map(item => {
            item.content = (item.category === "文字" && item.content.length > 10) ? item.content.slice(0, 10) + "..." : item.content
          })

           this.setData({
            myComments,
            showMyComments: true
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '数据获取失败',
          })
        }
      },
      fail: res => {
        wx.hideLoading()
      }
    })
  },
  onTapShowMyFavorites() {
    let isShowingMyFavorites = this.data.isShowingMyFavorites

    this.setData({
      isShowingMyFavorites: !isShowingMyFavorites
    })

    if (isShowingMyFavorites) return

    wx.showLoading({
      title: '加载中...',
    })
    qcloud.request({
      url: config.service.favoriteUrl,
      login: true,
      success: res => {
        wx.hideLoading()
        let data = res.data

        if(!data.code) {
          let myFavorites = data.data
          myFavorites.map(item => {
            item.content = (item.category === "文字" && item.content.length > 10) ? item.content.slice(0, 10) + "..." : item.content
          })
          this.setData({
            myFavorites,
            showMyFavorites: true
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '数据获取失败',
          })
        }
      },
      fail: res => {
        wx.hideLoading()
      }
    })
  },
  /**
   * 录音播放组件
   */
  onTapRecordPlay(event) {
    let data = event.currentTarget.dataset
    let currentOption = data.option
    let currentRecord = data.recordurl
    let id = data.id //唯一

    let isPlayMap = currentOption === "myComments" ? this.data.isPlayMapForMyComments : this.data.isPlayMapForMyFavorites

    if (!isPlayMap[id]) {
      /**
       * 播放一个录音的流程：同时只能有一个录音在播放
       */
      //初始化变量
      this.stopPlay()
      //开始当前录音的播放
      this.startPlay(currentRecord, currentOption, id)
    } else {
      //停止录音的播放
      this.stopPlay()
    }
  },
  startPlay(currentRecord, currentOption, id) {
    innerAudioContext.loop = true
    innerAudioContext.src = currentRecord
    innerAudioContext.play()
    this.startAnimationInterval()
    innerAudioContext.onPlay(() => {
      console.log('开始播放' + id)
    })
    innerAudioContext.onError(res => {
      console.log('开始播放' + id)
    })

    let temp = []
    temp[id] = true
    this.setData({
      isPlayMapForMyComments: currentOption === "myComments" ? temp : [],
      isPlayMapForMyFavorites: currentOption === "myFavorites" ? temp : [],
    })
  },
  stopPlay() {
    innerAudioContext.stop()
    innerAudioContext.onStop(() => {
      console.log("播放停止")
    })
    this.stopAnimationInterval()
    this.setData({
      isPlayMapForMyFavorites: [],
      isPlayMapForMyComments: []
    })
  },
  onTapNavigateToCommentDetail(event) {
    //跳转影评详情
    let data = event.currentTarget.dataset
    let currentOption = data.option
    let index = data.index
    let detail = this.data[currentOption][index]

    //格式化
    if (currentOption === "myComments") {
      detail.comment_id = detail.id
    }

    wx.navigateTo({
      url: `../commentDetail/commentDetail?movie_id=${detail.movie_id}&title=${detail.title}&image=${detail.image}&id=${detail.comment_id}`,
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
    this.stopPlay()
  },
  onUnload: function () {
    this.stopPlay()
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})