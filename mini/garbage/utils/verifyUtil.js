
const checkMobileNo = number => {
  var numReg = /^1\d{10}$/;
  if (!number || number.length == 0) {
    wx.showToast({
      icon: "none",
      title: '手机号码未输入'
    })
    return false
  } else if (!numReg.test(number)) {
    wx.showToast({
      icon: "none",
      title: '请输入正确的手机号码'
    })
    return false
  }
  return true
}

const checkPwd = pwdStr => {
  console.log("checkPwd--pwdStr:" + pwdStr);
  var pwdReg = /[a-zA-Z0-9]{6,18}/;
  if (!pwdReg.test(pwdStr)) {
    wx.showToast({
      icon: "none",
      title: '请输入6-18位, 由数字和英文字母组成的密码',
      duration: 2000
    })
    return false
  }
  return true
}

module.exports = {
  checkMobileNo: checkMobileNo,
  checkPwd: checkPwd
}