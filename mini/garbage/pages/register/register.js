// pages/register/register.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputMobileNo: "",
    inputCode: "",
    inputPwd: "",
    codeSent: false,
    checked: true,  // 隐私协议checkbox
    seconds: 60,
    pwdInputType: true,
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
  showPwd: function (t) {
    console.log("showPwd:" + JSON.stringify(t));
    var inputType = t.currentTarget.dataset.type;
    this.setData({
      pwdInputType: !inputType
    });
  },
  chkphone: function (t) {
    var inputStr = t.detail.value;
    console.log("chkphone:" + inputStr);
    VerifyUtil.checkMobileNo(inputStr)
  },
  inputPwd: function (e) {
    this.setData({
      inputPwd: e.detail.value
    })
  },
  checkPwd :function (e) {
    VerifyUtil.checkPwd(e.detail.value)
  },

  sendCode: function (e) {
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("input mobile error")
      return;
    } 
    //发送验证码
    WXAPI.sendSmsCode({
      mobileNo: this.data.inputMobileNo,
      category:1
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
  registerAndLogin: function (e) {
    console.log(e)
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("input mobile error")
      return;
    }
    if (this.data.inputCode.length == 0) {
      wx.showToast({
        iicon: "none",
        title: '验证码未输入'
      })
    } else if (!this.data.checked) {
      wx.showToast({
        icon: "none",
        title: '未勾选隐私政策'
      })
    } else {
      let that = this
      WXAPI.register({
        mobileNo: this.data.inputMobileNo,
        pwd: this.data.inputPwd,
        smsCode: this.data.inputCode
      }).then(function (res) {
        console.log("register:" + JSON.stringify(res));
        if (res.status != 200) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else
          if (res.loginToken.length > 0) {
            app.globalData.loginToken = res.loginToken
            wx.setStorageSync('loginToken', app.globalData.loginToken)
            wx.redirectTo({
              url: "../register/registerResult"
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
      inputMobileNo: "",
      inputCode: "",
      inputPwd:""
    })
  }

})