// pages/updatePwd/updatePwd.js
const WXAPI = require('../../wxapi/main')
const VerifyUtil = require('../../utils/verifyUtil.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputOldPwd: "",
    oldPwdInputType: true,
    inputNewPwd: "",
    newPwdInputType: true,
    confirmPwd: "",
    confirmPwdInputType: true,
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
  onInputOldPwd: function (e) {
    this.setData({
      inputOldPwd: e.detail.value
    })
  },
  onInputNewPwd: function (e) {
    this.setData({
      inputNewPwd: e.detail.value
    })
  },
  onInputNewPwd2: function (e) {
    this.setData({
      confirmPwd: e.detail.value
    })
  },
  showOldPwd: function (t) {
    //console.log("showOldPwd:" + JSON.stringify(t));
    var inputType = t.currentTarget.dataset.type;
    this.setData({
      oldPwdInputType: !inputType
    });
  },
  showNewPwd: function (t) {
    var inputType = t.currentTarget.dataset.type;
    this.setData({
      newPwdInputType: !inputType
    });
  },
  showConfirmPwd: function (t) {
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
  cancel: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },
  updatePwd: function (e) {
    console.log(e)
    if (!VerifyUtil.checkPwd(this.data.inputOldPwd)) {
      this.setData({
        inputOldPwd: ""
      })
      return
    }
    if (!VerifyUtil.checkPwd(this.data.inputNewPwd)) {
      this.setData({
        inputNewPwd: ""
      })
      return
    }
    if (this.data.inputNewPwd != this.data.confirmPwd) {
      wx.showToast({
        icon: "none",
        title: '您输入的新密码两次不一致，请您重新输入。'
      })
      this.setData({
        confirmPwd: ""
      })
    } else if (this.data.inputNewPwd == this.data.inputOldPwd) {
      wx.showToast({
        icon: "none",
        title: '新密码与原密码输入一致，请重新输入新密码'
      })
      this.setData({
        inputNewPwd: "",
        confirmPwd: ""
      })
    } else {
      let that = this
      WXAPI.updatePwd({
        loginToken: app.globalData.loginToken,
        pwd: this.data.inputOldPwd,
        newPwd: this.data.inputNewPwd
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
          that.gotoResultPage()
        } else {
          wx.showToast({
            icon: "none",
            title: '您输入的旧密码有误，请检查后重新输入。'
          })
        }
        that.clearPageData()
      })
    }
  },
  gotoResultPage: function () {
    wx.reLaunch({  // redirectTo
      url: "../updatePwd/updatePwdResult"
    });
    this.clearPageData();
  },
  clearPageData: function () {
    this.setData({
      inputOldPwd: "",
      inputNewPwd: "",
      confirmPwd: ""
    })
  }
})