// pages/func/score.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: 100,
    comment: '您真是垃圾分类达人，本次答题获得积分20分。',
    questionList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      result: options.score,
      comment: options.hint,
      questionList: JSON.parse(options.questionList)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  gotoanalysis: function () {
    wx.navigateTo({
      url: '/pages/func/analysis?questionList=' + JSON.stringify(this.data.questionList)
    })
  },

  exit: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})