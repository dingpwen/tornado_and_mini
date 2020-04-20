//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.weUserInfo) {
      this.transweb();
    }
  },
  getUserInfo: function (e) {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        app.globalData.weUserInfo = res.userInfo
        app.setStorage("weUserInfo", res.userInfo)
        that.transweb()
      }
    })
  },
  transweb: function() {
    if (app.globalData.loginToken) {
      wx.switchTab({
        url: '/pages/life/life',
      });
    } else {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  }
})
