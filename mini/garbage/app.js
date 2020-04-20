//app.js
const WXAPI = require('/wxapi/main')
const CONFIG = require('config.js')
const UTIL = require('utils/util')

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //获得缓存的用户信息：注册账号登录信息
    this.globalData.userInfo = this.getStorage("userInfo")
    this.globalData.loginToken = this.getStorage("loginToken")

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.weUserInfo = res.userInfo
              if (!this.globalData.loginToken) {
                this.enterMainPage(2)
              } else {
                this.enterMainPage(0)
              }
            }
          })
        } else {//如果没有授权就跳转到授权界面
          this.enterMainPage(1)
        }
      }
    })
  },
  globalData: {
    weUserInfo: null,//微信用户信息
    userInfo: null,//注册的用户信息
    wechatID: "",
    loginToken: ""
  },
  weLogin() {//登录并通过服务器获得openid
    let that = this;
    wx.login({
      success(res) {
        var jscode = res.code;
        that.getWeSession(jscode);
      },
      fail(res) {

      }
    });
  },

  getWeSession(jscode) {
    let that = this;
    wx.request({
      url: CONFIG.getWeSession,
      data: {
        jscode: jscode
      },
      method: 'GET',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success(res) {
        that.globalData.wechatID = res.data.openid
        that.setStorage("wechatID", res.data.openid);
        console.log("openid:" + res.data.openid)
      },
      fail(res) {
        console.log("res:", res)
      },
      complete(res) {

      }
    });
  },
  setStorage(name, value) {
    let timestamp = Date.parse(new Date()) + UTIL.getCachedTime()*1000
    try {
      wx.setStorageSync(name, value);
      wx.setStorageSync(name + "_expired", timestamp);
    } catch (e) {
      setStorage(name, value)
    }
  },
  getStorage(name){
    var value = wx.getStorageSync(name)
    if (value) {
      var now = Date.parse(new Date())
      let time = wx.getStorageSync(name + "_expired");
      if(!time) {
        return value
      } else if (now > time) {
        wx.setStorageSync(name, null);
        return null
      }
      now += UTIL.getCachedTime() * 1000
      wx.setStorageSync(name + "_expired", now);
    }
    return value
  },
  showWebError: function(res) {
    console.log("网络异常：", res)
    wx.showToast({
      icon: "none",
      title: "网络异常!"
    })
  },
  enterMainPage(flag) {
    console.log(flag);
    if (flag == 1) {
      wx.navigateTo({
        url: '/pages/index/index'
      });
    } else if (flag == 2){
      wx.navigateTo({
        url: '/pages/login/login'
      });
    } else {
      wx.switchTab({
        url: '/pages/life/life'
      });
    }
  }
})