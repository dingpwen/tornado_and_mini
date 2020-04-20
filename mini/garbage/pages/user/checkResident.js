// pages/user/checkResident.js
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
    nameOrnumberIsEmpty: true,
    name: "",
    cityId: 0,
    nhId: 0,
    addressId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      name: options.name,
      cityId: options.cityId,
      nhId: options.nhId,
      addressId: options.addressId,
      identity: options.identity - 2,
      inputedMobileNo: app.globalData.userInfo.mobileNo
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
  inputName: function (e) {
    var name = e.detail.value.trim()
    this.checkIsEmpty(name, this.data.number)
    this.setData({
      name: name
    })
  },
  inputNumber: function (e) {
    var value = e.detail.value.trim()
    this.checkIsEmpty(this.data.name, value)
    this.setData({
      number: value
    })
  },
  checkIsEmpty: function(name, number) {
    var empty = true
    if ((name && name.length != 0) && (number && number.length != 0)) {
      empty = false
    }
    this.setData({
      nameOrnumberIsEmpty: empty
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
  doSummit: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.number)) {
      return
    }
    let that = this
    WXAPI.submitResident({
      loginToken: app.globalData.loginToken,
      name: this.data.name,
      mobileNo: this.data.number,
      identity: this.data.identity + 2
    }).then(function (res) {
      if (res.status && res.status == 200 && res.isSuccess == 1) {
        that.saveUserInfo()
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
   * 提交审核成功，应当保存已修改的用户信息
   */
  saveUserInfo: function () {
    WXAPI.updateUserInfo({
      loginToken: app.globalData.loginToken,
      name: this.data.name,
      cityId: this.data.cityId,
      nhId: this.data.nhId,
      addressId: this.data.addressId,
      identity: this.data.identity + 2,
      type: 1
    }).then(function (res) {
      if (res.status && res.status == 200) {
        that.saveUserInfoAndExit()
      } else if (res.msg && res.msg.indexOf(":ok") < 0) {
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
   * 将用户信息保存到本地存储中，回退到上一个页面
   */
  saveUserInfoAndExit: function () {
    app.globalData.userInfo.name = this.data.name
    app.globalData.userInfo.cityId = this.data.cityId
    app.globalData.userInfo.nhId = this.data.nhId
    app.globalData.userInfo.addressId = this.data.addressId
    app.globalData.userInfo.identity = this.data.identity + 2
    app.setStorage("userInfo", app.globalData.userInfo)
    wx.showModal({
      title: "申请已提交",
      content: "您的申请已经提交户主审核，审核通过后，信息自动更新。",
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#239F9F',
      success: function (res) {
        wx.reLaunch({
          url: '/pages/me/me',
        })
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