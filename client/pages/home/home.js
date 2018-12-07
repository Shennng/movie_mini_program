// pages/home/home.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")

Page({
  data: {
    hotMovie: {},
    hotComment: {}
  },
  onLoad: function (options) {
    this.getHot()
  },
  getHot(callback) {
    qcloud.request({
      url: config.service.hotCommentUrl,
      success: res => {
        let data = res.data

        if (!data.code) {
          let hotData = data.data
          this.setData({
            hotMovie: hotData.hotMovie,
            hotComment: hotData.hotComment
          })
        }

        callback && callback()
      },
      fail: res => {

      }
    })
  },
  onTapToList() {
    wx.navigateTo({
      url: '../list/list',
    })
  },
  onTapToUser() {
    wx.navigateTo({
      url: '../user/user',
    })
  },
  onTapToThisMovie() {
    let movieDetail = this.data.hotMovie

    wx.navigateTo({
      url: `../detail/detail?id=${movieDetail.id}&title=${movieDetail.title}&image=${movieDetail.image}&description=${movieDetail.description}&type=${movieDetail.category}`,
    })
  },
  onTapToThisComment() {
    let data = this.data
    let movieDetail = data.hotMovie
    let id = data.hotComment.id
    
    wx.navigateTo({
      url: `../commentDetail/commentDetail?movie_id=${movieDetail.id}&id=${id}&title=${movieDetail.title}&image=${movieDetail.image}`,
    })
  },
  onPullDownRefresh: function () {
    this.getHot(() => {
      wx.showToast({
        title: '刷新成功',
      })
      wx.stopPullDownRefresh()
    })
  }
})