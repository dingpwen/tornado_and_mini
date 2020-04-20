var QR = require("qrcode.js")

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return year + "年" + month + "月" + day + "日";
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getQrSize() {
  return 350;
}

function getCachedTime() {
  return 7*24*3600;
}

/**
  * 适配不同屏幕大小的canvas
  */
const setCanvasSize = qrSize => {
  var size = {};
  try {
    var res = wx.getSystemInfoSync();
    var scale = 750 / qrSize; //同屏幕下canvas的适配比例；设计稿是750宽  350是因为样式wxss文件中设置的大小
    var width = res.windowWidth / scale;
    var height = width; //canvas画布为正方形
    size.w = width;
    size.h = height;
  } catch (e) {
    // Do something when catch error
    console.log("获取设备信息失败" + e);
  }
  return size;
}

/**
* 绘制二维码图片
*/
const createQrCode = (url, canvasId, qrSize, callback) => {
  var size = setCanvasSize(qrSize);
  //调用插件中的draw方法，绘制二维码图片
  QR.api.draw(url, canvasId, size.w, size.h);
  setTimeout(() => {
    canvasToTempImage(canvasId, callback);
  }, 1000);
}

/**
* 获取临时缓存照片路径，存入data中
*/
const canvasToTempImage = (canvasId, callback) => {
  //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
  wx.canvasToTempFilePath({
    canvasId: canvasId,
    success: function (res) {
      callback(res)
    },
    fail: function (res) {
      console.log(res);
    }
  });
}

const connectWebSocket = (url, openCallback, closeCallback, messageCallBack) => {
  wx.connectSocket({
    url: url
  })

  wx.onSocketOpen(function (res) {
    console.log('WebSocket连接已打开！')
    openCallback(res)
    wx.sendSocketMessage({
      data: 'Hello,World:' + Math.round(Math.random() * 0xFFFFFF).toString(),
    })//发送一个测试信息，可注释掉
  })

  wx.onSocketMessage(function (res) {
    console.log(res)
    messageCallBack(res)
  })

  wx.onSocketClose(function (res) {
    console.log('WebSocket连接已关闭！')
    closeCallback(res)
  })
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  getQrSize: getQrSize,
  getCachedTime: getCachedTime,
  createQrCode: createQrCode,
  connectWebSocket: connectWebSocket
}
