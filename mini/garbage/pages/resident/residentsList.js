// pages/resident/residentsList.js
const WXAPI = require('../../wxapi/main')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bindList: null,
    applyList: null,
    applyLen: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadResidents()
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
  /**
   * 根据号码查询出所有与户主有关的用户
   */
  loadResidents: function() {
    let that = this
    WXAPI.getResidentList({
      loginToken: app.globalData.loginToken
    }).then(function (res) {
      if(res.status && res.status == 200) {
        that.setData({
          bindList: JSON.parse(res.bindList),
          applyList: JSON.parse(res.applyList)
        })
        var len = this.applyList.length
        that.setData({
          applyLen: len
        })
      } else if (res.msg) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  },
  /**
   * 跳转到添加住户界面
   */
  addResident: function(e) {
    wx.navigateTo({
      url: "/pages/resident/addResident",
    })
  },
  /**
   * 删除已绑定住户，作用只是解绑吧，否则把别人的信息删除了
   */
  removeResident: function (e) {
    var id = e.currentTarget.dataset.id
    let that = this
    WXAPI.residentMgr({
      loginToken: app.globalData.loginToken,
      action: 1,
      userId: id
    }).then(function (res) {
      if (res.status && res.status == 200 && res.isSuccess == 1) {
        that.onLoad()
      } else if (res.msg) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  },
   /**
   * 对待绑定住户进行确认
   */
  confirmResident: function (e) {
    var id = e.currentTarget.dataset.id
    let that = this
    WXAPI.residentMgr({
      loginToken: app.globalData.loginToken,
      action: 2,
      userId: id
    }).then(function (res) {
      if (res.status && res.status == 200 && res.isSuccess == 1) {
        that.onLoad()
      } else if (res.msg) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  }
})