// pages/updateMobile/updateMobileNo.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    updateToken: "",
    inputMobileNo: "",
    inputCode: "",
    codeSent: false,
    seconds: 60
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.updateToken) {
      this.setData({
        updateToken: options.updateToken
      })
    }
    //console.log("onLoad--updateToken:"+options.updateToken)
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
  inputPhone: function (e) {
    this.setData({
      inputMobileNo: e.detail.value
    })
  },
  inputCode: function (e) {
    this.setData({
      inputCode: e.detail.value
    })
  },
  chkphone: function (t) {
    var inputStr = t.detail.value;
    console.log("chkphone:" + inputStr);
    VerifyUtil.checkMobileNo(inputStr)
  },
  sendCode: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("input mobile error")
      return;
    }
    //发送验证码
    WXAPI.sendSmsCode({
      mobileNo: this.data.inputMobileNo,
      category: 3
    })
    this.setData({
      codeSent: true,
      seconds: 60
    })
    this.timer()
    console.log("smsCode sent")
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
              codeSent: false
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
  updateMobile: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("input mobile error")
      return;
    }
    if (this.data.inputCode.length == 0) {
      wx.showToast({
        iicon: "none",
        title: '验证码未输入'
      })
    } else {
      let that = this
      WXAPI.updateMobileNo({
        loginToken: app.globalData.loginToken,
        updateToken: this.data.updateToken,
        newMobileNo: this.data.inputMobileNo,
        smsCode: this.data.inputCode
      }).then(function (res) {
        console.log("updateMobile:" + JSON.stringify(res));
        if (res.status != 200) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else
          if (res.isSuccess == 1) {
            wx.redirectTo({
              url: "../updateMobile/updateSuccess"
            });
            that.clearPageData()
          } else {
            wx.showToast({
              icon: "none",
              title: '验证码输入有误'
            })
          }
      })
    }
  },
  clearPageData: function () {
    this.setData({
      updateToken: "",
      inputMobileNo: "",
      inputCode: ""
    })
  }
})