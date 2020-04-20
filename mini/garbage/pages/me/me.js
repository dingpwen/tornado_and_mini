// pages/me/me.js
const WXAPI = require('../../wxapi/main')
const UTIL = require('../../utils/util')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasWeUserInfo:false,
    hasUserInfo: false,
    weUserInfo: null,//微信用户信息
    userInfo:null,//注册的用户信息
    residents: 0,
    identity: 0,
    greenScore:2780,
    getBagCount: 10,
    recoveryTimes: 10,
    startDate: "1970年1月1日",
    address:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!app.globalData.weUserInfo) {
      wx.redirectTo({
        url: '/pages/index/index',
      });
      return;
    } else {
      this.setData({
        weUserInfo: app.globalData.weUserInfo,
        hasWeUserInfo: true
      })
    }
    if (!app.globalData.loginToken) {
      wx.redirectTo({
        url: '/pages/login/login',
      });
      return;
    }
    if (!app.globalData.userInfo) {
      this.getUserInfo()
    } else {
      this.setData({
        userInfo: app.globalData.userInfo,
        identity: app.globalData.userInfo.identity,
        address: app.globalData.userInfo.address + app.globalData.userInfo.ra,
        hasUserInfo: true
      })
    }
    this.getRecordsCount()
  },
  getUserInfo: function() {
    let that = this
    WXAPI.getUserInfo({
      loginToken: app.globalData.loginToken
    }).then(function(res) {
      if (res.status && res.status == 200) {
        /*var userInfo = {
          "loginToken": app.globalData.loginToken,
          "name": res.name,
          "mobileNo": res.mobileNo,
          "ra": res.ra,
          "address": res.address,
          "identity": res.identity
        }*/
        console.log("res", res)
        try{
          app.globalData.userInfo = JSON.parse(res.userInfo)
        } catch(err) {
          app.globalData.userInfo = res.userInfo
        }
        app.setStorage("userInfo", app.globalData.userInfo)
        that.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
        that.setData({
          address: that.data.userInfo.address + that.data.userInfo.ra,
          identity: that.data.userInfo.identity
        })
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
   * 通过服务器获得各类数据
   */
  getRecordsCount:function() {
    let that =  this
    try{
      WXAPI.getMineData({
        loginToken: app.globalData.loginToken
      }).then(function (res) {
        console.log("res:", res)
        if(res.status && res.status == 200) {
          var dateStr = UTIL.formatDate(new Date(res.startDate))
          that.setData({
            greenScore: res.greenScore,
            getBagCount: res.getBagCount,
            recoveryTimes: res.recoveryTimes,
            startDate: dateStr
          });
        } else if (res.msg && res.msg.indexOf(":ok") < 0) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else {
          app.showWebError(res)
        }
      })
    } catch(e) {
      console.log("网络异常：", e)
    }
  },
  /**
   * 跳转到记录界面
   */
  gotoRecord: function (e) {
    wx.navigateTo({
      url: "/pages/record/records?type=" + e.currentTarget.dataset.type,
    })
  },
  /**
   * 跳转用户信息编辑界面
   */
  gotoEdit: function (e) {
    wx.navigateTo({
      url: "/pages/user/edituser",
    })
  },
  gotoResident: function (e) {
    wx.navigateTo({
      url: "/pages/resident/residentsList",
    })
  },
  gotoSecureSetting: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
})