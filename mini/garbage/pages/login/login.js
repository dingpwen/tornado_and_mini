// pages/login/login.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputMobileNo: "",
    inputPwd: "",
    pwdInputType: true
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
  inputPwd: function (e) {
    this.setData({
      inputPwd: e.detail.value
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
  login: function (e) {
    console.log(e)
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("login: input mobile error")
      return;
    } 
    if (!VerifyUtil.checkPwd(this.data.inputPwd)) {
      console.log("login:input pwd error")
      return;
    }
      let that = this
      WXAPI.login({
        mobileNo: this.data.inputMobileNo,
        pwd: this.data.inputPwd
      }).then(function (res) {
        console.log("login then:" + JSON.stringify(res));
        if (res.status != 200) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else
          if (res.loginToken.length > 0) {
            app.globalData.loginToken = res.loginToken;
            app.setStorage('loginToken', app.globalData.loginToken)
            wx.switchTab({
              url: "../life/life"
            });
            that.clearPageData()
          } else {
            wx.showToast({
              icon: "none",
              title: '登录失败'
            })
          }
      })
  },
  clearPageData: function () {
    this.setData({
      inputMobileNo: "",
      inputPwd: ""
    })
  }

})