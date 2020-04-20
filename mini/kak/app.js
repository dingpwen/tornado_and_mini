//app.js
const util = require('/utils/util.js');
const WXAPI = require('/wxapi/main')
//var event = require('/utils/event.js');
var CONFIG = require('config.js');
const bleUtil = require('/utils/bleUtil.js');
const UUID_OTA_SERVICE = "F000FFC0-0451-4000-B000-000000000000"
const UUID_IDENTFY = "F000FFC1-0451-4000-B000-000000000000"
var bleTimeOut; 

function inArray(arr, key, val) {
  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][key] === val) {
        return i;
      }
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

App({

  data: {
    devices: [],
    isDiscovering: false,
    initialization: false,  // 蓝牙是否初始化成功
    deviceId:"",
    serviceId:'',
    characteristicId:'',
    isPostConnection: false,
    isConnectFailed: false,
    snCode:"test-1112-222"
  },

  onLaunch: function() {
    wx.removeStorage({
      key: 'ble_deviceId',
      success(res) {
        console.log(res.data)
      }
    });
    this.globalData.sysinfo = wx.getSystemInfoSync();
    this.globalData.phoneRegistered = wx.getStorageSync("phoneRegistered");
    this.data.deviceId = wx.getStorageSync("ble_deviceId");
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    this.wxLogin();
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log("userInfo:", res.userInfo);

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
        //获取地理位置
        if (res.authSetting['scope.userLocation'] == undefined || res.authSetting['scope.userLocation'] == true) {
          this.getLocation()
        } else {
          this.getUserLocation()
        }
      }
    })
    this.openBluetoothAdapter();
  },
  globalData: {
    userInfo: null,
    wechatID:"",
    location:"",
    numberControled: false,
    phoneRegistered: "",
    concentration: "normal"
  },

  openBluetoothAdapter() {
    var currentPage = this;
    // 初始化蓝牙模块
    wx.openBluetoothAdapter({
      success: (res) => {
        wx.showToast({
          title: '蓝牙初始化完毕',
          duration: 1500
        });
        currentPage.data.initialization = true;
        console.log("currentpage.data.initialization:" + currentPage.data.initialization);
        // 判断当前的deviceId是否为空，为空则进行搜索，不为空则进行建立连接操作
        if (currentPage.data.deviceId === "") {
          // 开始搜索蓝牙
          currentPage.startBluetoothDevicesDiscovery();
        } else {
          // 建立蓝牙连接
          currentPage.createBLEConnection(currentPage.data.deviceId);
        }
      },
      fail: (res) => {
        console.log("openBluetoothAdapter-error-code:" + JSON.stringify(res));
        if (res.errCode === 10001) { // not available 当前蓝牙适配器不可用
          // 蓝牙初始化失败，将标志位置为false
          currentPage.data.initialization = false;
          // 设置蓝牙状态改变的监听
          wx.onBluetoothAdapterStateChange(function(res) {
            console.log("onBluetoothAdapterStateChange:" + JSON.stringify(res));
            if (res.available) {  // 蓝牙适配器可用
              // 蓝牙初始化完毕标志位置为true
              currentPage.data.initialization = true;
              // 判断是否连接过蓝牙设备
              if (currentPage.data.deviceId === "" && (!currentPage.data.isPostConnection)) {
                // 没连接过，开始搜索蓝牙
                currentPage.startBluetoothDevicesDiscovery();
                console.log("onBluetoothAdapterStateChange_currentpage:" + JSON.stringify(currentPage));
                setBLETimeOut(bleUtil.TIME_SEARCH_BLE_TIMEOUT);
              } else if (!currentPage.data.isPostConnection){
                // 连接过，则进行自动连接
                currentPage.createBLEConnection(currentPage.data.deviceId);
              }
            } else {   // 蓝牙适配器不可用
              currentPage.stopBluetoothDevicesDiscovery();
            }
          });
        }
      },
      complete: (res) => {

      }
    });

    function setBLETimeOut(delay) {
      console.log("setBLETimeOut:" + delay)
      if (currentPage.data.isDiscovering) {
        clearTimeout(bleTimeOut);
        bleTimeOut = setTimeout(function() {
          currentPage.stopBluetoothDevicesDiscovery();
        }, delay);
      }
    };

    function setOpenBluetoothFailed(delay) {
      if (!currentPage.data.isDiscovering) {

      }
    }
  },

  startBluetoothDevicesDiscovery() {
    var currentPage = this;
   console.log("startBluetoothDevicesDiscovery_currentPage:" + JSON.stringify(currentPage.data));
    if (currentPage.data.isDiscovering) {
      return
    }
    currentPage.data.isDiscovering = true;
    let result = {
      etype: bleUtil.bleStatus.INITIALIZE_SUCCESS
    }
    bleUtil.emitBleStatusEventData(result);

    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        currentPage.onBluetoothDeviceFound();
      },
    })
  },

  onBluetoothDeviceFound() {
    var currentPage = this;
    console.log("onBluetoothDeviceFound_currentPage:" + JSON.stringify(currentPage));
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return;
        }
        const foundDevices = currentPage.data.devices;
        const idx = inArray(foundDevices, 'deviceId', device.deviceId);
        if (idx === -1) {
          foundDevices[foundDevices.length] = device;
        } else {
          foundDevices[idx] = device;
        }
      });

      let devicesInfo = {
        etype: bleUtil.bleStatus.GET_DEVICES_LIST,
        devices: currentPage.data.devices
      }
      bleUtil.emitBleStatusEventData(devicesInfo);
    });
  },

  createBLEConnection(deviceId, name) {
    this.stopBluetoothDevicesDiscovery();
    var currentPage = this;
    if (currentPage.data.isConnectFailed) {
      let result = {
        etype: bleUtil.bleStatus.SHOW_BIND_LOADING
      }
      bleUtil.emitBleStatusEventData(result)
    }
    currentPage.data.isConnectFailed = false;
    currentPage.data.isPostConnection = true;
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("createBLEConnection_success_res:" + JSON.stringify(res));
        //res.etype = bleUtil.bleStatus.CREATE_BLE_CONNECTION;
        //event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.CREATE_BLE_CONNECTION, res)

        currentPage.data.deviceId = deviceId;
        wx.setStorage({
          key: 'ble_deviceId',
          data: deviceId,
        });
       //currentPage.getBLEDeviceServices(deviceId);
      },
      fail: (res) => {
        currentPage.data.isConnectFailed = true;
        // res.etype = bleUtil.bleStatus.CREATE_BLE_CONNECTION;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.CREATE_BLE_CONNECTION, res);
      },
      complete: (res) => {}
    });
  },
  readBLEToSave() {
    if (!this.data.deviceId) {
      return
    }
    //currentPage.getBLEDeviceServices(deviceId);
    WXAPI.bindDevice({
      wechatID: this.globalData.wechatID,
      deviceUUID: this.data.deviceId
    })
    if (!wx.getStorageSync("SalesData_" + this.data.deviceId)) {
      //此处需要获取snCode
      let nickname = ""
      if (this.globalData.userInfo) {
        nickname = this.globalData.userInfo.nickName
      }
      WXAPI.uploadSalesData({
        deviceUUID: this.data.deviceId,
        snCode: this.data.snCode,
        mobileNo: this.globalData.phoneRegistered,
        wechatID: this.globalData.wechatID,
        name: nickname,
        location: this.globalData.location,
        time: util.formatTime(new Date())
      })
      this.setStorage("SalesData_" + this.data.deviceId, this.data.deviceId)
    }
  },
  closeBLEConnection() {
    console.log("unbindDevice:" + this.data.deviceId)
    if (this.data.isPostConnection) {
      let that =this
      wx.closeBLEConnection({
        deviceId: that.data.deviceId,
        success: function (res) {
          console.log(res)
          WXAPI.unbindDevice({
            deviceUUID: that.data.deviceId
          })
          that.data.isPostConnection = false
          that.data.deviceId = ""
        }
      })
    }
  },
  getBLEDeviceServices(deviceId) {
    var currentPage = this;
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("getBLEDeviceServices:" + JSON.stringify(res));
        // res.etype = bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES, res);
        for (let i = 0; i < res.services.length; i++) {
          console.log(res.services[i].uuid)
          if (res.services[i].isPrimary && UUID_OTA_SERVICE == res.services[i].uuid) {
            currentPage.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid);
            currentPage.data.serviceId = res.services[i].uuid;
            return
          }
        }
      },
      fail: (res) => {
        // res.etype = bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.GET_BLE_DEVICE_SERVICES, res);
      },
      complete: (res) => {

      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    var currentPage = this;
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        // res.etype = bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS, res);
        console.log('getBLEDeviceCharacteristics success', JSON.stringify(res.characteristics) + "-----" + JSON.stringify(res));
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (UUID_IDENTFY != item.uuid) {
            continue;
          }
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            currentPage.data.deviceId = deviceId
            currentPage.data.serviceId = serviceId
            currentPage.data.characteristicId = item.uuid
            //currentPage.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        // res.etype = bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.GET_BLE_DEVICE_CHARACTERISTICS, res);
        console.error('getBLEDeviceCharacteristics', res)
      },
      complete(res) {

      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      console.log(characteristic)
      const idx = inArray(currentPage.data.devices, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${currentPage.data.devices.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      //this.setData(data)
    })
  },

  checkSeting(callback) {
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation'] === false) {
          callback(res, 1);
        }
        wx.authorize({
          scope: 'scope.userLocation',
          success(res) {
            callback(res, 1);
          },
          fail(res) {
            callback(res, 0);
          },
          complete() {

          }
        });
      },
      fail(res) {
        callback(res, 2);
      }
    });
  },

  stopBluetoothDevicesDiscovery() {
    var currentPage = this;
    currentPage.data.isDiscovering = false;
    wx.stopBluetoothDevicesDiscovery();
    
    let devicesInfo = {
      etype: bleUtil.bleStatus.STOP_DISCOVER,
      devices: currentPage.data.devices
    }
    bleUtil.emitBleStatusEventData(devicesInfo);
  },

  closeBluetoothAdapter: function() {
    wx.closeBluetoothAdapter();
    this.data.initialization = false;
  },

  isNeedSearch() {
    var needSearch = wx.getStorageSync("ble_deviceId");
    console.log("needSearch:" + needSearch);
    if (!needSearch) {
      return true;
    }
    return false;
  },

  enterMainPage(flag) {
    console.log(flag);
    if (flag) {
      wx.redirectTo({
        url: '../bindingpage/bindingpage',
      });
    } else {
      wx.switchTab({
        url: '../healthIndex/healthIndex',
      });
    }
  },

  writeBLECharacteristicValue() {
    var currentPage = this;
    // 向蓝牙设备发送一个0x00的16进制数据
    let buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, Math.random() * 255 | 0);
    console.log("writeBLECharacteristicValue_buffer:" + JSON.stringify(buffer));
    wx.writeBLECharacteristicValue({
      deviceId: currentPage.data.deviceId,
      serviceId: currentPage.data.serviceId,
      characteristicId: currentPage.data.characteristicId,
      value: buffer,
      success(res) {
        //res.etype = bleUtil.bleStatus.WRITE_BLE_CHARACTERISTIC_VALUE;
        //event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.WRITE_BLE_CHARACTERISTIC_VALUE, res);
      },
      fail(res) {
        // res.etype = bleUtil.bleStatus.WRITE_BLE_CHARACTERISTIC_VALUE;
        // event.emit(bleUtil.EVENT_BLE_STATUS_CHANGED, res);
        bleUtil.emitBleStatusEvent(bleUtil.bleStatus.WRITE_BLE_CHARACTERISTIC_VALUE, res)
      },
      complete(res) {

      }
    });
  },
  sendCmd(commond, onSuccess, onFailCallback) {
    //var sendCommonds = crc.getCRCCmd(commond);//对commond的CRC处理必须放在这里
    if(typeof onSuccess == 'undefined') {
      onSuccess = function (result) { }
    }
    //onSendSuccessCallBack = onSuccess;
    this.sendCmds(commond, 0, onFailCallback);
  },
  sendCmds(commond, index, onFailCallback) {
    var itemCmd;
    var isLast = false;
    if (commond.length > index + 40) {
      itemCmd = commond.substr(index, 40);
    } else {
      isLast = true;
      itemCmd = commond.substr(index);
    }
    this.writeCommendToBle(itemCmd, function (errMsg) {
      if (errMsg == 'ok' && !isLast) {
        this.sendCmds(commond, index + 40);
      }
    }, onFailCallback)
  },
  writeCommendToBle(commonds, onSendCallback, onFailCallback) {
    var commond = commonds;
    console.log("commond ：" + commond)
    let buffer = util.hexString2ArrayBuffer(commond);
    //console.log(`执行指令:${util.arrayBuffer2HexString(buffer)}`);

    wx.writeBLECharacteristicValue({
      deviceId: this.data.deviceId,
      serviceId: this.data.serviceId,
      characteristicId: this.data.characteristicId,
      value: buffer,
      success: function (res) {
        console.log('发送指令成功')
        console.log('writeBLECharacteristicValue success', res.errMsg)
        onSendCallback('ok');
      },
      fail: function (res) {
        console.log(`执行指令失败${res.errMsg}`);
        onFailCallback("执行指令失败");
      }
    })
  },
  setConcentration() {
    if (this.data.deviceId) {
      var onSendCallback = function (result) { }
      var onFailCallback = function (result) { }
      var commonds = ""
      if (this.globalData.concentration == "normal") {//实际具体指令部分需要根据协议修改
        commonds = "AABBCC778789FE"
      } else {
        commonds = "AABBCC778789FF"
      }
      this.sendCmd(commonds, onSendCallback, onFailCallback) 
    } else {
      wx.showToast({
        title: '设备未绑定',
        icon: 'none'
      })
    }
  },
  setNumberControled() {
    if (this.data.deviceId) {
      var onSendCallback = function (result) { }
      var onFailCallback = function (result) { }
      var commonds = ""
      if (this.globalData.numberControled) {//实际具体指令部分需要根据协议修改
        commonds = "AABBCC778789FFDFDFFD"
      } else {
        commonds = "AABBCC778789FFDFDFFE"
      }
      this.sendCmd(commonds, onSendCallback, onFailCallback) 
    } else {
      wx.showToast({
        title: '设备未绑定',
        icon: 'none'
      })
    }
  },
  setStorage(name, value) {
    try {
      wx.setStorageSync(name, value);
    } catch (e) {
      setStorage(name, value)
    }
  },
  getModel() {
    return this.globalData.sysinfo["model"];
  },

  getVersion() {
    return this.globalData.sysinfo["version"];
  },

  getSystem() {
    return this.globalData.sysinfo["system"];
  },

  getPlatform() {
    return this.globalData.sysinfo["platform"];
  },

  getSDKVersion() {
    return this.globalData.sysinfo["SDKVersion"];
  },


  versionWXComparison(standardVersion, appVersion) {
    standardVersion = standardVersion.split('.');
    appVersion = appVersion.split('.');

    const len = Math.max(standardVersion.length, appVersion.length);
    while (standardVersion.len < len) {
      standardVersion.push('0');
    }
    while(appVersion.length < len) {
      appVersion.push('0');
    }

    for(let i = 0; i < len; i++) {
      const standardVersion_num = parseInt(standardVersion[i]);
      const appVersion_num = parseInt(appVersion[i]);

      if (standardVersion_num < appVersion_num) {
        return 1;
      } else if (standardVersion_num > appVersion_num) {
        return -1;
      }
    }

    return 0;
  },

  checkWXVersion() {
    if (this.getPlatform() == 'android' && this.versionWXComparison('6.5.7', this.getVersion()) < 0) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      });
    } else if (this.getPlatform() == 'ios' && this.versionWXComparison('6.5.6', this.getVersion()) < 0) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
  },

  wxLogin() {
    var currentPage = this;
    wx.login({
      success(res) {
        var jscode = res.code;
        currentPage.getWXSession(jscode);
      },
      fail(res) {

      }
    });
  },

  getWXSession(jscode) {
    var currentPage = this;
    wx.request({
      url: CONFIG.getWXSession,
      data: {
        jscode: jscode
      },
      method: 'GET',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success(res) {
        currentPage.globalData.wechatID = res.data.openid
        currentPage.saveUnionid(res.data.openid);
        console.log("openid:" + res.data.openid)
      },
      fail(res) {
        console.log("res:")
        console.log(res)
      },
      complete(res) {

      }
    });
  },

  saveUnionid(unionid) {
    wx.setStorageSync("unionid", unionid);
  },
  getUserLocation: function() {
    let that=this
    wx.getSetting({
      success: res => {
        console.log("getUserLocation:" + JSON.stringify(res))
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
        } else {
          that.getLocation()
        }
      }
    })
  },
 getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(JSON.stringify(res))
        var latitude = res.latitude
        var longitude = res.longitude
        that.globalData.location = latitude + "," + longitude
        console.log('location:' + that.globalData.location)
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  }

});