// pages/feedback/feedback.js
const util = require('../../utils/util.js')
const WXAPI = require('../../wxapi/main')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled:true,
    feedContent:"",
    initialContent:""
  },

  feadInput: function (e) {
    this.setData({
      feedContent: e.detail.value
    })
    if (this.data.feedContent.length > 0){
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }
  },
  submitFead: function (e) {
    let that = this
    //提交意见到服务器
    WXAPI.submitFeadback({
      wechatID: app.globalData.wechatID,
      feedContent: this.data.feedContent,
      number: app.globalData.phoneRegistered,
      time: util.formatTime(new Date()),
      name: app.globalData.userInfo.nickName
    }).then( function(res){
      if(res.status == 200) {
        wx.showToast({
          title: '意见提交成功，感谢您的宝贵意见。',
          icon: 'none',
        })
        //清除数据
        that.setData({
          feedContent: "",
          disabled: true,
          initialContent: ""
        })
      } else {
        wx.showToast({
          title: '网络忙，请稍后再试。',
          icon: 'none',
        })
      }
    })
  },
})