// pages/list/list.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")

Page({
  data: {
    movieList: []
  },
  onLoad: function (options) {
    this.getList()
  },
  getList(callback) {
    qcloud.request({
      url: config.service.movieUrl,
      success: res => {
        let data = res.data

        if (!data.code) {
          this.setData({
            movieList: data.data
          })
        }
        callback && callback()
      },
      fail: res => {

      }
    })
  },
  onTapToDetail(event) {
    let index = + event.currentTarget.dataset.id
    let movieDetail = this.data.movieList[index]
    
    wx.navigateTo({
      url: `../detail/detail?id=${movieDetail.id}&title=${movieDetail.title}&image=${movieDetail.image}&description=${movieDetail.description}&type=${movieDetail.category}`,
    })
  },
  onPullDownRefresh: function () {
    this.getList(() => {
      wx.showToast({
        title: '刷新成功',
      })
      wx.stopPullDownRefresh()
    })
  }
})