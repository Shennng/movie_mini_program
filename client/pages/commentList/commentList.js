// pages/commentList/commentList.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")
const innerAudioContext = wx.createInnerAudioContext()

var _animation
var _animationIntervalId
var i

Page({
  data: {
    movieDetail: null,
    commentList: [],
    isPlayMap: []  //是否录音在播放
  },
  onLoad: function (options) {
    let movieDetail = options
    this.setData({
      movieDetail
    })
    this.getCommentList(movieDetail.movie_id)
  },
  getCommentList(id, callback) {
    //网络请求影评列表
    qcloud.request({
      url: config.service.commentUrl + id,
      success: res => {
        let data = res.data
        if(!data.code) {
          let commentList = data.data
          //格式化评论
          commentList.map(item => {
            item.content = (item.category === "文字" && item.content.length > 20) ? item.content.slice(0, 20) + "..." : item.content
          })
          this.setData({
            commentList
          })
        }
        callback && callback()
      },
      fail: res => {

      }
    })
  },
  /**
   * 录音播放组件
   */
  onTapRecordPlay(event) {
    let isPlayMap = this.data.isPlayMap
    let data = event.currentTarget.dataset
    let commentRecord = data.recordurl
    let id = data.id

    if (!isPlayMap[id]) {
      /**
       * 播放一个录音的流程：同时只能有一个录音在播放
       */
      //停止所有的播放
      this.stopPlay()
      //开始当前录音的播放
      this.startPlay(commentRecord, id)
    } else {
      //停止当前录音的播放
      this.stopPlay()
    }
  },
  startPlay(commentRecord, id) {
    innerAudioContext.loop = true
    innerAudioContext.src = commentRecord
    innerAudioContext.play()

    this.startAnimationInterval()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError(res => {
      console.log('播放发生错误')
    })

    let temp = []
    temp[id] = true
    this.setData({
      isPlayMap: temp
    })
  },
  stopPlay() {
    innerAudioContext.stop()
    innerAudioContext.onStop(() => {
      console.log('停止播放')
    })

    this.stopAnimationInterval()

    this.setData({
      isPlayMap: []
    })
  },
  onTapNavigateToCommentDetail(event) {
    //点击 查看详情 跳转
    let index = event.currentTarget.dataset.index
    let data = this.data
    let movieDetail = data.movieDetail
    let commentDetail = data.commentList[index]

    wx.navigateTo({
      url: `../commentDetail/commentDetail?movie_id=${movieDetail.movie_id}&title=${movieDetail.title}&image=${movieDetail.image}&id=${commentDetail.id}`,
    })
  },
  onShow: function () {
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
    this.stopPlay()
  },
  onUnload: function () {
    this.stopPlay()
  },
  onPullDownRefresh: function () {
    let id = this.data.movieDetail.movie_id
    this.getCommentList(id, () => {
      wx.showToast({
        title: '刷新成功',
      })
      wx.stopPullDownRefresh()
    })
  },
})