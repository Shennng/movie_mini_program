// pages/detail/detail.js
const qcloud = require("../../vendor/wafer2-client-sdk/index.js")
const config = require("../../config.js")

Page({
  data: {
    movieDetail: {},
    actionSheetHidden: true,
    actionSheetItems: ['文字', '音频']
  },
  onLoad: function (options) {
    let movieDetail = options
    let desc = movieDetail.description
    if (desc.length > 200) {
      movieDetail.description = desc.slice(0,200) + "..."
    }
    this.setData({
      movieDetail
    })
  },
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
  onTapToCommentList() {
    let movieDetail = this.data.movieDetail

    wx.navigateTo({
      url: `../commentList/commentList?movie_id=${movieDetail.id}&title=${movieDetail.title}&image=${movieDetail.image}`,
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})