// pages/user/edituser.js
const WXAPI = require('../../wxapi/main')
const UTIL = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    hasWeUserInfo: false,
    weUserInfo: null,
    userInfo: {
      name: "测试",
      mobileNo: "139564666",
      cityId: 0,
      nhId: 0,
      addressId: 0,
      identity: 0,
    },
    identities:["未认证", "户主", "家人", "租客"],
    name: "",
    cityId: 0,
    nhId: 0,
    addressId: 0,
    identity: 0,
    nameChanged:false,
    raChanged: false,
    addressChanged: false,
    identityChanged: false,
    addresses: ['501', '502', '503', '504', '505', '506'],
    ras: ['小区1', '小区2', '小区3'],
    raIndex: [0, 0],
    type: 1,  // 更新信息场景0:注册完后完善, 1:修改个人信息
    isClickCancle : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')
    if (options && options.type) {
      this.setData({
        type: options.type
      })
    }
    if (!app.globalData.weUserInfo) {
      wx.redirectTo({
        url: '/pages/index/index',
      });
      return;
    }
    this.setData({
      weUserInfo: app.globalData.weUserInfo,
      hasWeUserInfo: true
    })
    if (!app.globalData.loginToken) {
      wx.redirectTo({
        url: '/pages/login/login',
      });
      return;
    }
    if (app.globalData.userInfo) {
      this.setUserInfo()
    } else {
      this.getUserInfo()
    }
  },

  /**
   * 保存各项输入内容
   */
  inputName: function (e) {
    this.setData({
      name: e.detail.value.trim()
    })
    if (this.data.name != this.data.userInfo.name) {
      this.data.nameChanged = true
    } else {
      this.data.nameChanged = false
    }
  },
  bindPickerRa: function (e) {
    this.setData({
      nhId: e.detail.value
    })
    if (this.data.nhId != this.data.userInfo.nhId) {
      this.data.raChanged = true
    } else {
      this.data.raChanged = false
    }
  },
  bindPickerAddress: function (e) {
    this.setData({
      addressId: e.detail.value
    })
    if (this.data.addressId != this.data.userInfo.addressId) {
      this.data.addressChanged = true
    } else {
      this.data.addressChanged = false
    }
  },
  bindPickerChange: function (e) {
    this.setData({
      identity: e.detail.value
    })
    if (this.data.identity != this.data.userInfo.identity) {
      this.data.identityChanged = true
    } else {
      this.data.identityChanged = false
    }
  },
  /**
   * 退出编辑界面
   */
  cancelEdit: function (e) {
    console.log("cancelEdit")
    this.setData (
      {
        isClickCancle: true
      }
    )
    this.goBack()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload---isClickCancle:" + this.data.isClickCancle)
    if (!this.data.isClickCancle) {
      this.goBack()
    }
  },
  goBack: function () {
    console.log("goBack--type:" + this.data.type)
    wx.navigateBack({
      delta: 1
    })
    // if (this.data.type == 0) {  }  // 注册成功界面过来
  },
  /**
   * 点完成按钮，如果信息有修改，就链接服务器保存数据，然后退出
   */
  doEdit: function (e) {
    if (this.data.identity == 1 && (this.data.raChanged || this.data.addressChanged)) {
      var param = "name=" + this.data.name + "&cityId=" + this.data.cityId + "&nhId=" + this.data.nhId + "&addressId=" + this.data.addressId + "&identity=" + this.data.identity
      wx.navigateTo({
        url: '/pages/user/checkHouseholder?' + param
      })
    } else if (this.data.nameChanged || this.data.identityChanged ||
      this.data.raChanged || this.data.addressChanged) {
      let that = this
      WXAPI.updateUserInfo({
        loginToken: app.globalData.loginToken,
        name: this.data.name,
        cityId: this.data.cityId,
        nhId: this.data.nhId,
        addressId: this.data.addressId,
        identity: this.data.identity,
        type: this.data.type
      }).then(function(res) {
        if (res.status && res.status == 200) {
          wx.showToast({
            icon: "none",
            duration: 5000,
            title: "更新居住信息需要户主审核，您输入的相关信息，已提交户主审核。"
          })
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
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
    
  },
  /**
   * 将用户信息保存到本地存储中，回退到上一个页面
   */
  saveUserInfoAndExit:function() {
    app.globalData.userInfo.name = this.data.name
    app.globalData.userInfo.cityId = this.data.cityId
    app.globalData.userInfo.nhId = this.data.nhId
    app.globalData.userInfo.addressId = this.data.addressId
    app.globalData.userInfo.identity = this.data.identity
    app.setStorage("userInfo", app.globalData.userInfo)
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      address: this.data.address + this.data.ra,
      identity: this.data.identity
    })  
    wx.navigateBack({
      delta: 1
    })
  },
  setUserInfo: function() {
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    })
    this.setData({
      name: this.data.userInfo.name,
      cityId: this.data.userInfo.cityId,
      nhId: this.data.userInfo.nhId,
      addressId: this.data.userInfo.addressId,
      identity: this.data.userInfo.identity
    })
  },
  getUserInfo: function () {
    let that = this
    WXAPI.getUserInfo({
      loginToken: app.globalData.loginToken
    }).then(function (res) {
      if (res.status && res.status == 200) {
        console.log("res", res)
        app.globalData.userInfo = JSON.parse(res.userInfo)
        app.setStorage("userInfo", app.globalData.userInfo)
        that.setUserInfo()
      } else if (res.msg) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  }
})