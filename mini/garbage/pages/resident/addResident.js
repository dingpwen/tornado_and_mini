// pages/resident/addResident.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    number: "",
    identities: ["家人", "租客"],
    identity: 0,
    numberIsEmpty: true
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
  inputName: function (e) {
    var name = e.detail.value.trim()
    this.setData({
      name: name
    })
  },
  inputNumber: function (e) {
    var value = e.detail.value.trim()
    var empty = true
    if(value && value.length != 0) {
      empty = false
    }
    this.setData({
      number: value,
      numberIsEmpty: empty
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      identity: e.detail.value
    })
  },
  /**
   * 先查找号码是否已存在数据库，如果已存在提示已绑定过，不存在则保存
   */
  doSave: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.number)) {
      return
    }
    let that = this
    WXAPI.addResident({
      loginToken:app.globalData.loginToken,
      name: this.data.name,
      mobileNo: this.data.number,
      identity: this.data.identity + 2
    }).then(function (res) {
      if (res.status && res.status == 200 && res.isSuccess == 1) {
        wx.reLaunch({
          url: '/pages/resident/residentsList',
        })
      } else if (res.msg) {
        wx.showModal({
          title: "手机号码已绑定",
          content: res.msg,//该手机号码已绑定其它居住信息，请确认号码输入是否正确。
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#239F9F',
          success: function (res) {
            console.log("关闭对话框")
          }
        })
      } else {
        app.showWebError(res)
      }
    })
  },
  /**
   * 退出界面
   */
  doCancel: function (e) {
    wx.navigateBack({
      delta: 1
    })
  }
})