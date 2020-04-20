// pages/healthIndex/healthIndex.js
var app = getApp();
var event = require('../../utils/event.js');
var getSmokeCount = require("../../config.js").getSmokeCount;
var uploadSmokeData = require("../../config.js").uploadSmokeData;
var getSmokeDataByDate = require("../../config.js").getSmokeDataByDate;
const oneDaySeconds = 24 * 60 * 60;
const bleUtil = require('../../utils/bleUtil.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromYear: '2019',
    fromMonth: '02',
    fromDay: '18',
    lossSmoke: '0.0',
    lossSmokes: '0.0',
    lossTar: '0.0',
    lossCO: '0.0',
    isRequesting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.data.initialization && app.data.deviceId !== "") {
      this.showReadLoading();
      app.getBLEDeviceServices(app.data.deviceId);
    }
    event.on(bleUtil.EVENT_BLE_STATUS_CHANGED, this, this.readBLEInfo);
    //this.updateDataToService();   // test
    this.requestDataFromService();
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
    event.remove(bleUtil.EVENT_BLE_STATUS_CHANGED, this);
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
  
  readBLEInfo: function(result) {
    if (result.etype === bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES) {
      this.showReadingError(result);
    } else if (result.etype === bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS) {
      this.showReadingError(result);
    }
  },

  showReadLoading: function () {
    wx.showLoading({
      title: '正在同步数据',
      mask: true
    });
  },

  showReadingError: function (result) {
    if (result.errCode !== 0) {
      this.hideSearchLoading();
      var errorStr = util.errorStr(result.errCode);
      this.showErrorToast(errorStr);
    }
  },

  showErrorToast: function (errStr) {
    wx.showToast({
      title: errStr,
      icon: "none",
      duration: 1500
    });
  },

  hideReadLoading: function () {
    wx.hideLoading();
  },

  //上传吸烟数据到服务器
  updateDataToService: function() {
    var random1 = 1,
      random2 = 1,
      random3 = 1,
      random4 = 1,
      random5 = 1,
      random6 = 1;
    var howmuchday = 17;
    var nowTime = Date.parse(new Date()) / 1000;
    var startTime1 = nowTime + 1000 - oneDaySeconds * howmuchday,
      startTime2 = nowTime + 10000 - oneDaySeconds * howmuchday,
      endTime1 = nowTime + 1100 - oneDaySeconds * howmuchday,
      endTime2 = nowTime + 11000 - oneDaySeconds * howmuchday,
      startTime3 = nowTime + 2000 - oneDaySeconds * howmuchday,
      startTime4 = nowTime + 20000 - oneDaySeconds * howmuchday,
      endTime3 = nowTime + 2100 - oneDaySeconds * howmuchday,
      endTime4 = nowTime + 21000 - oneDaySeconds * howmuchday,
      startTime5 = nowTime - 3000 - oneDaySeconds * howmuchday,
      startTime6 = nowTime - 30000 - oneDaySeconds * howmuchday,
      endTime5 = nowTime - 3100 - oneDaySeconds * howmuchday,
      endTime6 = nowTime - 31000 - oneDaySeconds * howmuchday;
    var bleid = null;
    var that = this;
    try {
      bleid = '99:99:99:99:99:99'//wx.getStorageSync('ble_deviceId')
    } catch (e) {
      console.log("===e===" + e);
    }
    console.log(bleid);
    var smokeList = JSON.stringify([[startTime1, endTime1, random1], [startTime2, endTime2, random2], [startTime3, endTime3, random3], [startTime4, endTime4, random4], [startTime5, endTime5, random5], [startTime6, endTime6, random6]]) 
    wx.request({
      url: uploadSmokeData, // 仅为示例，并非真实的接口地址
      data: {
        deviceUUID: bleid,
        smokeList: smokeList
      },
      method:'POST',
      success(res) {
        console.log(res)
        console.log(res.data)
        that.requestDataFromService();
      },
      fail(res) {
        console.log(res)
        console.log(res.data)
      }
    })
  },

  requestDataFromService: function() {
    console.log(this.data.isRequesting)
    if (this.data.isRequesting) {
      return
    }
    wx.showNavigationBarLoading();
    this.setData({
      isRequesting: true
    })
    var bleid = null;
    const that = this;
    try {
      bleid = '99:99:99:99:99:99' //wx.getStorageSync('ble_deviceId')
    } catch (e) {
      console.log("===e===" + e);
    }
    console.log(bleid);
    wx.request({
      url: getSmokeCount, // 仅为示例，并非真实的接口地址
      data: {
        deviceUUID: bleid
      },
      success(res) {  
        console.log(res)
        var bindtime = res.data.time;
        var firsttime = res.data.firstTime;
        var time = firsttime > bindtime ? bindtime : firsttime;
        var date = new Date(time * 1000),
          year = date.getFullYear(),
          month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1),
          day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()),
          lossSmoke = (res.data.cnt / 14).toFixed(2),
          lossSmokes = (res.data.cnt / 14 / 20).toFixed(2),
          lossTar = (lossSmoke * 0.55).toFixed(2),
          lossCO = (lossSmoke * 0.55).toFixed(2);

        that.setData ({
          fromYear: year,
          fromMonth: month,
          fromDay: day,
          lossSmoke: lossSmoke,
          lossSmokes: lossSmokes,
          lossTar: lossTar,
          lossCO: lossCO,
          isRequesting: false
        })
        wx.setStorageSync('bindDay', date)
              wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading()
      },
      fail(res) {
        that.setData({
          isRequesting: false
        })
        wx.showModal({
          content: '网络加载失败，请检查网络后再试一次',
          showCancel: false,
          confirmColor: '#239F9F',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        });
        wx.hideNavigationBarLoading()
      }
    })
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.requestDataFromService();
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
    }, 60000);
    wx.stopPullDownRefresh() //停止下拉刷新
  },
});