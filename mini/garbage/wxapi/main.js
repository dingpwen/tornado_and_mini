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

module.exports = {
  request,
  sendSmsCode: (data) => {
    return request(CONFIG.sendSmsCode, "post", data)
  },
  register: (data) => {
    return request(CONFIG.register, "post", data)
  },
  findPwdAuthSmsCode: (data) => {
    return request(CONFIG.findPwdAuthSmsCode, "post", data)
  },
  findPwdResetPwd: (data) => {
    return request(CONFIG.findPwdAuthSmsCode, "post", data)
  },
  login: (data) => {
    return request(CONFIG.login, "post", data)
  },
  getMainData: (data) => {
    return request(CONFIG.getMainData, "get", data)
  },
  getMineData: (data) => {
    return request(CONFIG.getMineData, "get", data)
  },
  getUserInfo: (data) => {
    return request(CONFIG.getUserInfo, "get", data)
  },
  updateUserInfo: (data) => {
    return request(CONFIG.updateUserInfo, "post", data)
  },
  getResidentList: (data) => {
    return request(CONFIG.getResidentList, "get", data)
  },
  residentMgr: (data) => {
    return request(CONFIG.residentMgr, "post", data)
  },
  addResident: (data) => {
    return request(CONFIG.addResident, "post", data)
  },
  isCanGetBag: (data) => {
    return request(CONFIG.isCanGetBag, 'get', data)
  },
  getGarbageBag: (data) => {
    return request(CONFIG.getGarbageBag, 'post', data)
  },
  getBagHistory: (data) => {
    return request(CONFIG.getBagHistory, 'get', data)
  },
  getRecycleQRCodeInfo: (data) => {
    return request(CONFIG.getRecycleQRCodeInfo, 'get', data)
  },
  getRecycleHistory: (data) => {
    return request(CONFIG.getRecycleHistory, 'get', data)
  },
  getTradeQRCodeInfo: (data) => {
    return request(CONFIG.getTradeQRCodeInfo, 'get', data)
  },
  getScoreHistory: (data) => {
    return request(CONFIG.getScoreHistory, 'get', data)
  },
  updateMobileCheckPwd: (data) => {
    return request(CONFIG.updateMobileCheckPwd, 'post', data)
  },
  updateMobileNo: (data) => {
    return request(CONFIG.updateMobileNo, 'post', data)
  },
  updatePwd: (data) => {
    return request(CONFIG.updatePwd, 'post', data)
  },
  householdAuth: (data) => {
    return request(CONFIG.householdAuth, 'post', data)
  },
  getQuestions: (data) => {
    return request(CONFIG.getQuestions, 'get', data)
  },
  submitAnswer: (data) => {
    return request(CONFIG.submitAnswer, 'post', data)
  }
}
