// pages/exchange/exQrcode.js
const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
var UT = require("../..//utils/util.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    greenScore: 10,
    connected: false,
    socketUrl: "ws://" + CONFIG.socketUrl,
    qrcodeUrl: "https://www.gome.com/trash/exhange.html?loginToken=",
    qrcodePath: "../../images/qrcode.jpg",
    accountNo: "",
    imageSize: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.greenScore) {
      this.setData({
        greenScore: options.greenScore
      })
    }
    this.setData({
      imageSize: UT.getQrSize()
    })
    this.getQrcodeUrl()
  },
  /**
   * 从服务器端获得二维码Url，服务器与手机端在任务结束前都需要保存此url，用于check
   */
  getQrcodeUrl: function() {
    let that = this
    WXAPI.getTradeQRCodeInfo({
      loginToken: app.globalData.loginToken,
    }).then(function(res) {
      console.log("res:", res)
      if(res.status && res.status == 200) {
        that.setData({
          qrcodeUrl: res.tradeCode,
          accountNo: res.accountNo
        });
        that.getQrcodeImg(that.data.qrcodeUrl)
      } else if (res.msg && res.msg.indexOf(":ok") < 0) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
        var url = that.data.qrcodeUrl + app.globalData.loginToken
        that.getQrcodeImg(url)
      }
    })
  },
  /**
   * 根据链接获得动态二维码
   */
  getQrcodeImg: function (url) {
    let that = this
    console.log("imageSize:", this.data.imageSize)
    UT.createQrCode(url, "myCanvas", this.data.imageSize, function(res) {
      var tempFilePath = res.tempFilePath;
      console.log(tempFilePath);
      that.setData({
        canvasHidden: false,
        qrcodePath: tempFilePath
      })
      that.createConnect()
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeSocket()
  },
 
  /**
   * 链接socket，监听服务器返回信息
   */
  createConnect: function () {
    console.log("Socket 监听路径：", this.data.socketUrl)
    let that =  this
    UT.connectWebSocket(this.data.socketUrl, function (res) {
      that.setData({
        connected: true
      })
    }, function (res) {
      that.setData({
        connected: false
      })
    }, function (res) {
      that.dealSocketMessage(res)
    })
  },
  /**
   * 关闭websocket
   */
  closeSocket: function() {
    if (this.data.connected) {
      wx.closeSocket()
      this.setData({
        connected: false
      })
    }
  },
  /**
   * 获取服务器端传来的兑换成功与否的消息
   */
  dealSocketMessage: function(message) {
    try {
      var res = JSON.parse(message.data)
      if (res.url && res.url == this.data.qrcodeUrl) {//确认是本次投递的url
        if (res.status == 200) {//投递成功
          this.closeSocket()
          wx.navigateTo({
            url: '/pages/exchange/result'
          })
        } else {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        }
      }
    } catch(err){
      console.log("返回格式错误-返回数据：", message)
      console.log("返回格式错误-错误原因：", err)
    }
  },
  /**
   * 跳转到投递结果界面
   */
  doExit: function (e) {
    wx.navigateTo({
      url: '/pages/exchange/result'
    })
  }
})