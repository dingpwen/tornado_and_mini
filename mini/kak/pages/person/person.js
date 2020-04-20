// pages/person/person.js
const WXAPI = require('../../wxapi/main')
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    numChecked: false,
    phoneRegistered: "",
    hidePhoneDlg: true,
    codeSended:false,
    seconds:60,
    checked:false,
    intialPhoneNumber:"",
    initialCode:"",
    inputedPhoneNumber: "",
    inputedCode: "",
    hideConDlg:true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    concentration: "normal",
    curConcentration: "normal",
    items: [
      { name: 'normal', value: '正常', checked: 'true'},
      { name: 'big', value: '大浓度'}
    ]
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    if (!app.globalData.phoneRegistered && app.globalData.wechatID) {
      let that=this
      WXAPI.getMobileNo({
        wechatID: app.globalData.wechatID
      }).then(function (res) {
        console.log(res)
        if(res.status == 200) {
          app.globalData.phoneRegistered = res.mobileNo
          that.setData({
            phoneRegistered: res.mobileNo
          })
        }
      })
    }
    this.setData({
      numChecked: app.globalData.numberControled,
      phoneRegistered: app.globalData.phoneRegistered,
      concentration: app.globalData.concentration,
      curConcentration: app.globalData.concentration
    })
    for (var i=0; i<2; i++) {
      if (app.globalData.concentration === this.data.items[i].name) {
        this.data.items[i].checked = "true"
      } else {
        this.data.items[i].checked = "false"
      }
    }
  },
  getPermission: function (e) {
    let that = this
    wx.showModal({
      title: '权限申请',
      content: 'KAK电子烟申请获取你的微信昵称、头像、地区及性别',
      confirmText: '允许',
      success: function (res) {
        if (res.confirm) {
          that.getUserInfo(e) 
        }
      }
    })
  },
  getUserInfo: function (e) {
    let that=this
    wx.getUserInfo({
      success: function(res) {
        app.globalData.userInfo = res.userInfo
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  checkProtocol: function (t) {
    console.log("checkProtocol.....");
    wx.navigateTo({
      url: '../protocol/protocol'
    });
  },
  bindphone: function (e) {
    this.setData({
      hidePhoneDlg: false
    })
  },
  inputPhone: function (e) {
    this.setData({
      inputedPhoneNumber: e.detail.value
    })
  },
  inputCode: function (e) {
    this.setData({
      inputedCode: e.detail.value
    })
  },
  checkboxChange:function(e){
    this.setData({
      checked: !this.data.checked
    })
  },
  onPhoneRegister: function (e) {
    if (e.detail.tapEvt == "cancel") {
      this.phoneCancel(e)
    } else {
      this.phoneConfirm(e)
    }
  },
  phoneConfirm: function (e) {
    console.log(e)
    var numReg = /^1\d{10}$/;
    if (this.data.inputedPhoneNumber.length == 0) {
      wx.showToast({
        icon: "none",
        title: '手机号码未输入'
      })
    } else if (!numReg.test(this.data.inputedPhoneNumber)) {
      wx.showToast({
        icon: "none",
        title: '请输入正确的手机号码'
      })
    } else if (this.data.inputedCode.length == 0) {
      wx.showToast({
        iicon: "none",
        title: '验证码未输入'
      })
    } else if (!this.data.checked) {
      wx.showToast({
        icon: "none",
        title: '未勾选隐私政策'
      })
    } else {
      let that=this
      WXAPI.authSmsCodeLogin({
        wechatID: app.globalData.wechatID,
        mobileNo: this.data.inputedPhoneNumber,
        smsCode:this.data.inputedCode
      }).then(function(res) {
        console.log(res)
        if(res.status != 200) {
          wx.showToast({
            icon: "none",
            title: res.msg
          })
        } else
        if(res.isSuccess == 1) {
          app.globalData.phoneRegistered = that.data.inputedPhoneNumber
          wx.setStorageSync('phoneRegistered', app.globalData.phoneRegistered)
          that.setData({
            hidePhoneDlg: true,
            phoneRegistered: app.globalData.phoneRegistered
          })
          that.clearPhoneData()
        } else {
          wx.showToast({
            icon: "none",
            title: '验证码输入有误'
          })
        }
      })
    }
  },
  phoneCancel: function (e) {
    this.setData({
      hidePhoneDlg: true,
    })
    this.clearPhoneData()
  },
  clearPhoneData:function() {
    this.setData({
      intialPhoneNumber: "",
      initialCode: "",
      inputedPhoneNumber: "",
      inputedCode: ""
    })
  },
  sendCode: function(e){
    var numReg = /^1\d{10}$/;
    if (this.data.inputedPhoneNumber.length == 0) {
      wx.showToast({
        icon: "none",
        title: '手机号码未输入'
      })
    } else if (!numReg.test(this.data.inputedPhoneNumber)) {
      wx.showToast({
        icon: "none",
        title: '请输入正确的手机号码'
      })
    } else {
      //发送验证码
      WXAPI.sendSmsCode({
        mobileNo: this.data.inputedPhoneNumber
      })
      this.setData({
        codeSended: true,
        seconds:60
      })
      this.timer()
    }
  },
  timer: function () {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          this.setData({
            seconds: this.data.seconds - 1
          })
          if (this.data.seconds <= 0) {
            this.setData({
              seconds: 60,
              codeSended: false
            })
            resolve(setTimer)
          }
        }
        , 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },
  goShop: function(){
    WXAPI.gotoShop()
  },
  numCtrlChange: function (e) {
    //app.globalData.numberControled = e.detail.value
    //console.log('switch1 发生 change 事件，携带值为', e.detail.value)
    app.globalData.numberControled = !this.data.numChecked
    if (!app.globalData.numberControled ) {
      let that = this;
      wx.showModal({
        title: '确认关闭？',
        content: '关闭后，对每次吸烟口数不做限制，这有可能会使您吸烟量增加，确认关闭？',
        confirmText: '关闭',
        confirmColor: '#239F9F',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              numChecked: false
            })
            //去设置控制值
            app.setNumberControled()
          } else if (res.cancel) {
            app.globalData.numberControled = true
            that.setData({
              numChecked: true
            })
          }
        }
      })
    } else {
      this.setData({
        numChecked: true
      })
      //去设置控制值
      app.setNumberControled()
    }
  },
  setConcentration: function() {
    this.setData({
      hideConDlg: false
    })
  },
  radioChange: function(e) {
    console.log(e.detail.value)
    this.setData({
      curConcentration: e.currentTarget.dataset.value
    })
    if (e.currentTarget.dataset.value == "normal"){
      this.setData({
        'items[1].checked': "",
        'items[0].checked': "true"
      })
    } else {
      this.setData({
        'items[0].checked': "",
        'items[1].checked': "true"
      })
    }
  },
  onConChecked: function (e) {
    if (e.detail.tapEvt == "cancel") {
      this.modalCancel(e)
    } else {
      this.modalConfirm(e)
    }
  },
  modalConfirm: function(e) {
    this.setData({
      hideConDlg: true
    })
    if (app.globalData.concentration === this.data.curConcentration) {
      //设置未变就不用做什么
    } else {
      app.globalData.concentration = this.data.curConcentration
      this.setData({
        concentration: app.globalData.concentration
      })
      //链接蓝牙设置控制值
      app.setConcentration()
    }
  },
  modalCancel: function (e) {
    if (app.globalData.concentration == this.data.items[0].name) {
      this.setData({
        'items[1].checked': "",
        'items[0].checked': "true"
      })
    } else {
      this.setData({
        'items[0].checked': "",
        'items[1].checked': "true"
      })
    }
    this.setData({
      hideConDlg: true
    })
  },
  unTyping:function () {
    wx.showModal({
      title: '确认解绑设备？',
      content: '设备解绑后，将无法对设备进行控制，确认要解绑吗？',
      confirmText: '解绑',
      confirmColor: '#239F9F',
      success: function (res) {
        if(res.confirm) {
          //去解绑设备
          app.closeBLEConnection()
        } else if(res.cancel) {
          console.log("放弃解绑设备")
        }
      }
    })
  },
  gotoServer:function(e){
    console.log(e)
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  }
})