// pages/information/information.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners:[{
      picUrl:"../../images/cig_default_head.png",
      info:"将烟弹拆开后，对准烟杆插口插入，听到咔声后完成烟弹安装，使用过程中，请不要将烟弹长时间倒置。KAK电子烟烟弹有多种口味，欢迎登陆官方商城选购。"
      },
      {
        picUrl: "../../images/cig_bluetooth.png",
        info: "请将手机蓝牙打开，确保烟盒电源开启，烟杆插回到烟盒，点击开始绑定，开始搜索可用设备，点击搜索到的KAK电子烟设备即可完成绑定"
      },
      {
        picUrl: "../../images/cig_setting.png",
        info: "研究显示，用户在使用电子烟时，很容易无节制的吸烟，一定程度上造成吸烟过量。KAK电子烟在设计过程中，模拟真烟的口感及习惯，每吸14口后您需要将烟杆插回到烟盒中，再次拿出后才能继续吸烟。您可以在设备设置中关闭该限制。"
      },
      {
        picUrl: "../../images/cig_data.png",
        info: "为了您直观的了解您的吸烟情况，我们为您统计一个月内的吸烟情况，您可以在数据统计中查看近一月的吸烟情况，为更好的统计数据，请您每次吸烟后将烟杆插回烟盒，并定期开启手机蓝牙与设备进行同步。"
      }
    ],
    swiperCurrent: 0,
    showButton: false,
  },

  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })

    console.log("===current===" + e.detail.current);
    var showButton = false
    var firstlaunch = "firstlaunch"
    try {
      firstlaunch = wx.getStorageSync('key')

    } catch (e) {
      console.log("===e===" + e);
    }
    console.log("===firstlaunch===" + firstlaunch);
    if (e.detail.current == this.data.banners.length - 1 && firstlaunch != "bootcomplated") {
      showButton = true
    }
    console.log("===showButton===" + showButton);
    this.setData({
      showButton: showButton
    })
    console.log("===showButton===" + this.data.showButton);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  bindtap: function () {
    wx.setStorage({
      key: 'key',
      data: 'bootcomplated',
    })
    wx.redirectTo({
      url: '../../pages/bindingpage/bindingpage',
    })
  }
})