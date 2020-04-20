// pages/forgetPwd/resetPwd.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    resetToken:"",
    mobileNo:"",
    inputPwd: "",
    pwdInputType: true,
    confirmPwd:"",
    confirmPwdInputType: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.resetToken) {
      this.setData({
        resetToken: options.resetToken
      })
    }
    if (options.mobileNo) {
      this.setData({
        mobileNo: options.mobileNo
      })
    }
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
  onInputPwd: function (e) {
    this.setData({
      inputPwd: e.detail.value
    })
  },
  onInputPwd2: function (e) {
    this.setData({
      confirmPwd: e.detail.value
    })
  },
  showPwd: function (t) {
    //console.log("showPwd:" + JSON.stringify(t));
    var inputType = t.currentTarget.dataset.type;
    this.setData({
      pwdInputType: !inputType
    });
  },
  showConfirmPwd: function (t) {
    //console.log("showConfirmPwd:" + JSON.stringify(t));
    var inputType = t.currentTarget.dataset.type;
    this.setData({
      confirmPwdInputType: !inputType
    });
  },
  checkPwd: function (t) {
    var inputStr = t.detail.value;
    console.log("checkPwd--inputStr:" + inputStr);
    VerifyUtil.checkPwd(this.data.inputStr)
  },
  resetPwd: function (e) {
    console.log(e)
    if (!VerifyUtil.checkPwd(this.data.inputPwd)) {
      return
    }
    if (this.data.inputPwd != this.data.confirmPwd) {
      wx.showToast({
        icon: "none",
        title: '两次输入密码不一致, 请重新输入'
      })
      this.setData({
        confirmPwd: ""
      })
    } else {
      let that = this
      WXAPI.findPwdResetPwd({
        resetToken: this.data.resetToken,
        mobileNo: this.data.inputMobileNo,
        pwd: this.data.inputPwd
      }).then(function (res) {
        console.log("forgetPwd:" + JSON.stringify(res));
        if (res.status != 200) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else if (res.isSuccess && res.isSuccess == 1) {
          wx.showToast({
            icon: "none",
            title: '密码修改成功'
          })
          that.gotoLoginPage()
        } else {
          wx.showToast({
            icon: "none",
            title: '修改密码失败'
          })
          that.gotoForgetPwdPage()
        }
      })
    }
  },
  gotoLoginPage: function () {
    wx.redirectTo({
      url: "../login/login"
    });
    this.clearPageData();
  },
  gotoForgetPwdPage: function () {
    wx.navigateBack({
      delta: 1
    })
    this.clearPageData();
  },
  clearPageData: function () {
    this.setData({
      inputPwd: "",
      confirmPwd:""
    })
  }
})