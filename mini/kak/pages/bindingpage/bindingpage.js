// pages/bindingpage/bindingpage.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [{
      picUrl: "../../images/cig_bluetooth.png",
      info: "欢迎使用KAK电子烟，请打开手机蓝牙、定位以及电子烟盒电源完成绑定，绑定及设置过程中，请将电子烟烟杆插入烟盒。"
    }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkWXVersion();
      
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


  startBind:function() {
    this.bindNow();
  },

  catchTouchMove: function (res) {
    return false
  },

  bindNow: function() {
    if (!app.data.initialization) {
      wx.showModal({
        title: '开启蓝牙',
        content: '绑定需要开启手机蓝牙和定位权限，请确保手机蓝牙和定位开启，并确保电子烟盒已开机。',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../connection/connection',
            });
          } else if (res.cancel) {

          }
        }
      });
    } else {
      wx.navigateTo({
        url: '../connection/connection',
      });
    }
  }
});