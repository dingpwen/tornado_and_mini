// pages/life/life.js
const WXAPI = require('../../wxapi/main')
const UTIL = require('../../utils/util.js')
const CONFIG = require('../../config.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    greenScore: 2780,
    recycleTimes: 10,
    classifyTimes: 10,
    startDate: "2018年5月6日",
    connected: false,
    socketUrl: "ws://" + CONFIG.socketUrl,
    curBagUrl: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRecordsCount()
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
    let that = this
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
  closeSocket: function () {
    if (this.data.connected) {
      wx.closeSocket()
      this.setData({
        connected: false
      })
    }
  },
  /**
   * 查询积分等各项数据
   */
  getRecordsCount: function () {
    let that = this
    try {
      WXAPI.getMainData({
        loginToken: app.globalData.loginToken
      }).then(function (res) {
        console.log("res:", res)
        if (res.status && res.status == 200) {
          var dateStr = UTIL.formatDate(new Date(res.startDate))
          that.setData({
            greenScore: res.greenScore,
            recycleTimes: res.recycleTimes,
            classifyTimes: res.classifyTimes,
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
    } catch (e) {
      console.log("网络异常：", e)
    }
  },
  /**
   * 跳转到各项子功能
   */
  gotoFunc: function (e) {
    console.log("url:", e.currentTarget.dataset.url)
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  /**
   * 下载题目并跳转到答题界面
   */
  gotoAnswer: function(e) {
    console.log(app.globalData.loginToken)
    var timeoutID = ""
    WXAPI.getQuestions({
      loginToken: app.globalData.loginToken
    }).then(function (res) {
      console.log("res:", res)
      clearTimeout(timeoutID);
      if (res.status == 200 && res.state == 0) {
        wx.navigateTo({
          url: "/pages/func/answer?questions=" + JSON.stringify(res.questionList) 
        })
      } else {
        var msg = res.state == 1 ? "您今天已经答过题了，明天再答吧。" : "服务器故障，正在紧急修复中，请您稍等再答题。"
        wx.showModal({
          content: msg,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#239F9F',
          success: function (res) {
            console.log("关闭对话框")
          }
        })
      }
    })
    console.log("settimeout")
    timeoutID = setTimeout(() => {
      wx.showModal({
        content: "获取题目失败，请检查网络连接。",
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#239F9F',
        success: function (res) {
          console.log("关闭对话框")
        }
      })
    }, 60000);
    console.log(timeoutID)
  },
  /**
   * 跳转到积分兑换页面
   */
  gotoExchange: function (e) {
    wx.navigateTo({
      url: "/pages/exchange/exchangeQrcode?greenScore=" + this.data.greenScore
    })
  },
  /**
   * 查询服务器，确认是否可以取袋
   */
  tryScanForBag: function (e) {
    let that =  this
    WXAPI.isCanGetBag({
      loginToken: app.globalData.loginToken
    }).then(function(res){
      console.log("res:", res)
      if (res.status && res.status == 200 && res.isCanGetBag != 0) {
          that.scanForBag()
        } else if (res.msg && res.msg.indexOf(":ok") < 0) {
          wx.showModal({
            title: "取袋出错",
            content: res.msg,
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#239F9F',
            success: function(res) {
              console.log("关闭对话框")
            }
          })
        } else {
          app.showWebError(res)
        }
    })
    
  },
  /**
   * 扫二维码取袋，手机将扫描到的二维码传给服务器，服务器再传给取袋设备
   */
  scanForBag:function() {
    let that = this
    wx.showToast({
      icon: "none",
      title: "请击取袋机上取袋按钮，扫码取袋。"
    })
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ["qrCode"],
      success: function (res) {
        console.log(res) //{charSet: "utf-8", result: "https://qr.alipay.com/cpx09117zkufqgfuw5z0ja5", errMsg: "scanCode:ok", rawData: "aHR0cHM6Ly9xci5hbGlwYXkuY29tL2NweDA5MTE3emt1ZnFnZnV3NXowamE1", scanType: "QR_CODE"}
        if (res.errMsg.indexOf(":ok") > 0 && res.result && res.result.indexOf("https://gome.trash.com") >= 0) {
          that.setData({
            curBagUrl: res.result
          })
          //发送给服务器，保存取袋相关数据，服务器通知取袋机掉袋
          WXAPI.getGarbageBag({
            loginToken	: app.globalData.loginToken,
            qrCodeMsg: res.result
          })
          //监听服务器回传的取袋信息（成功与否）
          that.createConnect()
        }
      }
    })
  },
  /**
   * 获取服务器端传来的取袋成功与否的消息
   */
  dealSocketMessage: function (message) {
    try {
      var res = JSON.parse(message.data)
      if (res.url && res.url == this.data.curBagUrl) {//确认是本次投递的url
        if (res.isSuccess == 1) {//投递成功
          wx.showToast({
            icon: "none",
            title: "取袋成功"
          })
        } else {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        }
        this.closeSocket()
        this.setData({
          curBagUrl: ''
        })
      }
    } catch (err) {
      console.log("返回格式错误-返回数据：", message)
      console.log("返回格式错误-错误原因：", err)
    }
  },
})