// pages/user/checkHouseholder.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputedMobileNo: "",
    inputedCode: "",
    name: "",
    cityId: 0,
    nhId: 0,
    addressId: 0,
    identity: "",
    sendTitle: "发送验证码",
    codeSended: false,
    seconds: 60
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
      identity: options.identity,
      inputedMobileNo: app.globalData.userInfo.mobileNo
    }) 
    console.log("userInfo:", app.globalData.userInfo)
    console.log("inputedMobileNo:", this.data.inputedMobileNo)
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
  inputMobileNo: function (e) {
    this.setData({
      inputedMobileNo: e.detail.value.trim()
    })
  },
  inputCode: function (e) {
    this.setData({
      inputedCode: e.detail.value.trim()
    })
  },
  sendCode: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.inputedMobileNo)) {
      return
    }
    //发送验证码
    WXAPI.sendSmsCode({
      mobileNo: this.data.inputedMobileNo
    })
    this.setData({
      codeSended: true,
      seconds: 60,
      sendTitle: "重新获取",
    })
    this.timer()
  },
  timer: function () {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          this.setData({
            seconds: this.data.seconds - 1
          })
          if (this.data.seconds <= 0) {
            this.setData({
              seconds: 60,
              codeSended: false
            })
            resolve(setTimer)
          }
        }
        , 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  doSummit: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.inputedMobileNo)) {
      return
    }
    let that = this
    WXAPI.householdAuth({
      loginToken: app.globalData.loginToken,
      mobileNo: this.data.inputedMobileNo,
      smsCode: this.data.inputedCode
    }).then(function(res) {
      if(res.status && res.status == 200 && res.isSuccess == 1) {
        that.saveUserInfo()
      } else if(res.msg) {
        wx.showModal({
          title: "验证不通过",
          content: res.msg,//您的手机号码错误，请您核实后重新输入，或到居委会更新信息。
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
  doCancel: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 户主验证成功，应当保存已修改的用户信息
   */
  saveUserInfo: function(){
    WXAPI.updateUserInfo({
      loginToken: app.globalData.loginToken,
      name: this.data.name,
      cityId: this.data.cityId,
      nhId: this.data.nhId,
      addressId: this.data.addressId,
      identity: this.data.identity,
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
    app.globalData.userInfo.identity = this.data.identity
    app.setStorage("userInfo", app.globalData.userInfo)
    wx.showModal({
      title: "验证通过",
      content: "您的身份验证通过，居住信息已经更新。",
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#239F9F',
      success: function (res) {
        wx.reLaunch({
          url: '/pages/me/me',
        })
      }
    })
  }
})