// pages/updateMobile/checkPwd.js
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
  onInputPhone: function (e) {
    this.setData({
      inputMobileNo: e.detail.value
    })
  },
  onInputPwd: function (e) {
    this.setData({
      inputPwd: e.detail.value
    })
  },
  chkphone: function (t) {
    var inputStr = t.detail.value;
    console.log("chkphone:" + inputStr);
    VerifyUtil.checkMobileNo(inputStr)
  },
  confirm: function (e) {
    console.log(e)
    if (!VerifyUtil.checkMobileNo(this.data.inputMobileNo)) {
      console.log("checkPwd: input mobile error")
      return;
    }
    if (!VerifyUtil.checkPwd(this.data.inputPwd)) {
      console.log("checkPwd: input pwd error")
      return;
    }
    let that = this
    WXAPI.updateMobileCheckPwd({
      loginToken: app.globalData.loginToken,
      mobileNo: this.data.inputMobileNo,
      pwd: this.data.inputPwd
    }).then(function (res) {
      console.log("checkPwd:" + JSON.stringify(res));
      if (res.status != 200) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
        //that.gotoUpdateMobilePage("WX123456875")  // just FOR TEST
      } else
        if (res.updateToken.length > 0) {
          that.gotoUpdateMobilePage(res.updateToken)
          that.clearPageData()
        } else {
          wx.showToast({
            icon: "none",
            title: '密码不正确，请重新输入'
          })
        }
    })
  },
  gotoUpdateMobilePage: function (updateToken) {
    wx.navigateTo({
      url: "../updateMobile/updateMobileNo?updateToken=" + updateToken
    });
    this.clearPageData();
  },
  clearPageData: function () {
    this.setData({
      inputMobileNo: "",
      inputPwd: ""
    })
  }
})