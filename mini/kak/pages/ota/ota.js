// pages/ota/ota.js
const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
const app = getApp()

// const otaUtil = require('../../utils/otaUtil.js');
// const FILE_BUFFER_SIZE = 0x40000;
// const OAD_BLOCK_SIZE = 16;
// const OAD_BUFFER_SIZE = 2 + OAD_BLOCK_SIZE;
// var mFileBuffer = new Array(FILE_BUFFER_SIZE).fill('');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    savedOtaFilePath:"",

    //mFileImgHdr: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOtaFileUrl()
  },


  getOtaFileUrl: function () {
    let currentPage = this;
    console.log("getOtaFileUrl--deviceUUID:" + wx.getStorageSync("ble_deviceId"))
    WXAPI.getOtaFileUrl({
      deviceUUID: wx.getStorageSync("ble_deviceId"),
      deviceVersion : "1133",
      deviceRomVerion : "7"
    }).then(function (res) {
      console.log("getOtaFileUrl--hasOtaFile: " + res.hasOtaFile + "; fileUrl:" + res.fileUrl)
      if (res.hasOtaFile && res.fileUrl) {
        currentPage.downloadOtaFile(res.fileUrl)
      }
    })
  },

  downloadOtaFile: function(fileUrl) {
    let currentPage = this;
    console.log("downloadOtaFile----showLoading")
    wx.showLoading({
      title: '开始下载新固件...',
    })
    wx.downloadFile({
      url: CONFIG.host + fileUrl,
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log("res: "+ JSON.stringify(res))
        wx.showToast({
          title: '新固件下载成功',
          icon: 'success',
          duration: 2000
        })

        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success (res) {
            const savedFilePath = res.savedFilePath
            currentPage.setData({
              savedOtaFilePath: savedFilePath
            })
            console.log("downloadOtaFile--success--filePath: " + savedFilePath)
          },fail() {

          }

        })
      },
      fail: function (res) {
        wx.showToast({
          title: '固件下载失败',
          icon: 'warn',
          duration: 2000
        })
      },
      complete: function (res) {
        console.log("complete---hideLoading")
        wx.hideLoading();
      },
    })
  },

  loadFile: function (filepath) {

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

  }


})