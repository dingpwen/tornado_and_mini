const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const errorStr = errorcode =>{
  var errorString = '正常';
  switch (errorcode) {
    case 0:
      errorString = '正常';
      break;
    case 10000:
      errorString = '未初始化蓝牙适配器';
      break;
    case 10001:
      errorString = '当前蓝牙适配器不可用';
      break;
    case 10002:
      errorString = '没有找到指定设备';
      break;
    case 10003:
      errorString = '连接失败';
      break;
    case 10004:
      errorString = '没有找到指定服务';
      break;
    case 10005:
      errorString = '没有找到指定特征值';
      break;
    case 10006:
      errorString = '当前连接已断开';
      break;
    case 10007:
      errorString = '当前特征值不支持此操作';
      break;
    case 10008:
      errorString = '系统异常';
      break;
    case 10009:
      errorString = 'Android系统版本低于 4.3 不支持 BLE';
      break;
  }
  return errorString;
}

const getDates = (days, validDay, todate) => {
  var dateArry = [];
  for (var i = 0; i < days; i++) {
    var dateObj = dateLater(todate, i, validDay, days);
    dateArry.push(dateObj)
  }
  return dateArry;
}

const dateLater = (dates, later, validDay, days) => {
  let dateObj = {};
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  let date = new Date(dates);
  date.setDate(date.getDate() + later - validDay + 1);
  let day = date.getDay();
  let yearDate = date.getFullYear();
  let month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
  let dayFormate = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
  dateObj.day = day;
  dateObj.year = yearDate;
  dateObj.month = month;
  dateObj.dayFormate = dayFormate;
  dateObj.time = month + '.' + dayFormate;
  dateObj.week = show_day[day];
  dateObj.index = days - 1;
  return dateObj;
}

const day = date => {
  return date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
}

const month = date => {
  return (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
}

const year = date => {
  return date.getFullYear()
}

const isLeapYear = year => {
  if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
    return true;
  }
  return false;
}

const getDaysOfMonth = (date, later) => {
  console.log(date);
  var month = date.getMonth(); //注意此处月份要加1，所以我们要减一
  var year = date.getFullYear();
  if (later != 0) {
    month = month == 0 ? 12 - later : month - later;
  }
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

const lastDay = date => {
  let day = date.getDate();
  date.setDate(day - 1);
  return date;
}

const nextDay = date => {
  let day = date.getDate();
  date.setDate(day + 1);
  return date;
}

const lastTime = (date, time) => {
  let day = date.getDate();
  date.setDate(day - time);
  return date;
}

const nextTime = (date, time) => {
  let day = date.getDate();
  date.setDate(day + time);
  return date;
}

function hexString2ArrayBuffer(hexStr) {
  var count = hexStr.length / 2;
  let buffer = new ArrayBuffer(count);
  let dataView = new DataView(buffer);
  for (var i = 0; i < count; i++) {
    var curCharCode = parseInt(hexStr.substr(i * 2, 2), 16);
    dataView.setUint8(i, curCharCode);
  }
  return buffer;
}

module.exports = {
  formatTime: formatTime,
  errorStr: errorStr,
  getDates: getDates,
  day: day,
  month: month,
  year: year,
  isLeapYear: isLeapYear,
  getDaysOfMonth: getDaysOfMonth,
  lastDay: lastDay,
  nextDay: nextDay,
  lastTime: lastTime,
  nextTime: nextTime,
  hexString2ArrayBuffer: hexString2ArrayBuffer
}
