//webservice 接口调用
const CONFIG = require('../config.js')

const request = (url, method, data) => {
  console.log(method + ":" + data)
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(request) {
        resolve(request.data)
      },
      fail(error) {
        reject(error)
      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          //throw reason;
          return true;
        }
      );
    }
  );
}

const gotoShop = function() {
  console.log("跳转到商城")
}

module.exports = {
  gotoShop: gotoShop,
  request,
  sendSmsCode: (data) => {
    return request(CONFIG.sendSmsCode, "post", data)
  },
  authSmsCodeLogin: (data) => {
    return request(CONFIG.authSmsCodeLogin, "post", data)
  },
  getMobileNo: (data) => {
    return request(CONFIG.getMobileNo, "get", data)
  },
  submitFeadback: (data) => {
    return request(CONFIG.submitFeedback, 'post', data)
  },
  uploadSalesData: (data) => {
    return request(CONFIG.uploadSalesData, 'post', data)
  },
  bindDevice: (data) => {
    return request(CONFIG.bindDeviceUUID, 'post', data)
  },
  unbindDevice: (data) => {
    return request(CONFIG.unbindDeviceUUID, 'post', data)
  },
  getOtaFileUrl: (data) => {
    return request(CONFIG.getOtaFileUrl, 'get', data)
  }
}
