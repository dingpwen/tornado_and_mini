// pages/connection/connection.js
const bleUtil = require('../../utils/bleUtil.js');
var event = require('../../utils/event.js');
var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.showSearchLoading();
    app.startBluetoothDevicesDiscovery();
    event.on(bleUtil.EVENT_BLE_STATUS_CHANGED, this, this.readBLEInfo);

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    event.remove(bleUtil.EVENT_BLE_STATUS_CHANGED, this);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  createBLEConnection: function(e) {
    const ds = e.currentTarget.dataset;
    const deviceId = ds.deviceId;
    const name = ds.name;
    this.showBindLoading();
    app.createBLEConnection(deviceId, name);
  },

  readBLEInfo: function(result) {
    console.log("readBLEInfo:" + JSON.stringify(result));
    if (result.etype === bleUtil.bleStatus.CREATE_BLE_CONNECTION) {
      this.showBindingError(result);
      if (result.errCode === 0) {
        event.remove(bleUtil.EVENT_BLE_STATUS_CHANGED, this);
        app.readBLEToSave();
        this.comeToHomepage();
      }
    } else if (result.etype === bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES) {
      this.showBindingError(result);
    } else if (result.etype === bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS) {
      this.showBindingError(result);
    } else if (result.etype === bleUtil.bleStatus.GET_DEVICES_LIST) {
      this.hideSearchLoading();
      console.log("result.devices:" + result.devices.length);
      this.obtainDevices(result.devices);
    } else if (result.etype === bleUtil.bleStatus.STOP_DISCOVER) {
      if (result.devices.length === 0) {
        this.hideSearchLoading();
        this.setData({
          empty: true
        });
      }
    } else if (result.etype === bleUtil.bleStatus.INITIALIZE_SUCCESS) {
      console.log("initialize:" + app.data.initialization);
      wx.showLoading({
        title: '正在搜索设备',
        mask: true
      });
    } else if (result.etype === bleUtil.bleStatus.WRITE_BLE_CHARACTERISTIC_VALUE) {
      this.showBindLoading();
      if (result.errCode === 0) {
        event.remove(bleUtil.EVENT_BLE_STATUS_CHANGED, this);
        this.comeToHomepage();
      }
    } else if (result.etype === bleUtil.bleStatus.SHOW_BIND_LOADING) {
      this.showBindLoading();
    }
  },

  obtainDevices: function(data) {
    console.log("devices-->", JSON.stringify(data));
    this.setData({
      devices: data
    });
  },

  showSearchLoading: function() {
    if (!app.data.initialization) {
      wx.showLoading({
        title: '等待蓝牙初始化',
        mask: true
      });
    } else {
      wx.showLoading({
        title: '正在搜索设备',
        mask: true
      });
    }
  },

  hideSearchLoading: function() {
    wx.hideLoading();
  },

  startSearch: function() {
    app.startBluetoothDevicesDiscovery();
  },

  showErrorToast: function(errStr) {
    wx.showToast({
      title: errStr,
      icon: "none",
      duration: 1500
    });
  },

  showBindSuccess: function() {
    wx.showToast({
      title: '设备已绑定',
      icon: 'success',
      duration: 1500
    });
  },

  comeToHomepage: function() {
    wx.switchTab({
      url: "/pages/healthIndex/healthIndex"
    });
  },

  showBindLoading: function() {
    wx.showLoading({
      title: '正在绑定',
      mask: true
    });
  },

  showBindingError: function(result) {
    if (result.errCode !== 0) {
      this.hideSearchLoading();
      var errorStr = util.errorStr(result.errCode);
      this.showErrorToast(errorStr);
    }
  }


})