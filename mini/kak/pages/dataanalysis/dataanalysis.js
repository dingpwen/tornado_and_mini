// pages/dataanalysis/dataanalysis.js

// 路径是wxCharts文件相对于本文件的相对路径
var wxCharts = require('../../utils/wxcharts.js');
const util = require('../../utils/util.js');
var getSmokeDataByDate = require("../../config.js").getSmokeDataByDate;
var getSmokeData = require("../../config.js").getSmokeData;
var lineChartDay = null;
var lineChartWeek = null;
var lineChartMonth = null;
const oneDaySeconds = 24 * 60 * 60 * 1000;
//var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,   //当前页面，0：今日，1：近一周，2：近一月
    categories: [], //时间点
    times: [],       //抽烟数据
    isLeapYear: false,  //是否是闰年
    validDay: 0,        //有效数据天数
    yearstart: 0,       //起始年
    monthstart: 0,      //起始月
    daystart: 0,        //起始日
    yearend: 0,         //结束年（近一周界面使用）
    monthend: 0,        //结束月（近一周界面使用）
    dayend: 0,          //结束日（近一周界面使用）
    leftimg: '../../images/cig_more_left.png',   //向左切换箭头
    rightimg: '../../images/cig_more_right.png',  //向右切换箭头
    startday: null,      //显示的起始日期（今日界面就为显示的日期）
    endday: null,         //显示的结束日期（近一周和近一月逻辑使用）
    syncdata: true,        //是否正在同步数据
    nodata: true,          //服务器端无数据
    canbeshow: true,          //获取数据,是否隐藏提示框
    showday: true,          //当前显示今日
    showweek: false,        //当前显示一周
    showmonth: false,       //当前显示一月
    smokeSum: '--',         //总抽烟口数
    packet: '--',           //相当于普通烟多少包
    branch: '--',           //相当于普通烟多少支
    windowWidth: 320,       //折线图区域默认宽度
    smokeMax: 10,          //默认最大抽烟数
    smokeList: [],           //服务器返回的数据列表
    bindDay: new Date(),    //蓝牙绑定日期
    hasnext: false,         //可以切换到后一天，有效日期为当前日期时，为false
    haslast: false,          //可以切换到前一天，有效日期为当前日期时，为false
    today: '',                //今天的日期
    tab_title0: 'tab_title_select',
    tab_title1: 'tab_title_default',
    tab_title2: 'tab_title_default',
    tab_title_text0: 'tab_title_text_select',
    tab_title_text1: 'tab_title_text_default',
    tab_title_text2: 'tab_title_text_default',
    networkerror: false,
    isrequesting: false,
    onemonth: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //图标的宽度
    try {
      var res = wx.getSystemInfoSync();
      console.log(res)
      this.setData({
        windowWidth : res.windowWidth
      })
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    try {
      var bindDay = wx.getStorageSync('bindDay');
      if (bindDay) {
        var bindtime = new Date(bindDay);
        this.setData({
          bindDay: bindtime
        })
      } else {
        var bindtime = new Date();
        this.setData({
          bindDay: bindtime
        })
      }
    } catch (e) {
      console.error('getStorageSync bindDay!');
    }



    /*var simulationData = this.createSimulationData();
    this.initWXChart(lineChartDay, simulationData, windowWidth, "lineCanvasDay");
    this.initWXChart(lineChartWeek, simulationData, windowWidth, "lineCanvasWeek");
    this.initWXChart(lineChartMonth, simulationData, windowWidth, "lineCanvasMonth");*/
    var date = new Date();
    var haslast = true;
    if ((date.getDate() <= this.data.bindDay.getDate()) && (date - this.data.bindDay) <= oneDaySeconds) {
      haslast = false;
    }
    this.setData({
      currentTab: 0,
      showday: true,
      showweek: false,
      showmonth: false,
      canbeshow: true,
      nodata: true,
      syncdata: true,
      haslast: haslast,
      hasnext: false,
      today: date
    });

    this.oneDay(new Date());
    //this.lineShow("lineCanvasDay");
    // let timer1 = setTimeout(() => {
    //   if (this.data.nodata) {
    //     this.setData({
    //       hidden: false,
    //       syncdata: false
    //     })
    //   }
    // }, 2000);
    
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

  confirm: function() {
    this.setData({
      canbeshow: false,
      nodata: false
    })
    this.lineShow(lineChartDay, "lineCanvasDay");
  },

  oneDay: function (time) {
    // var random1 = Math.floor(Math.random() * (500 - 50 + 1) + 50),
    //   random2 = Math.floor(Math.random() * (800 - 100 + 1) + 100),
    //   random3 = Math.floor(Math.random() * (1000 - 200 + 1) + 200),
    //   random4 = Math.floor(Math.random() * (300 - 10 + 1) + 10),
    //   random5 = Math.floor(Math.random() * (600 - 300 + 1) + 300);
    this.setData({
      yearstart: util.year(time),
      monthstart: util.month(time),
      daystart: util.day(time),
      startday: time
    })
    this.requestSmokeDateFromService();
    // this.setData({
    //   categories: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    //   times: [0],
    //   yearstart: util.year(time),
    //   monthstart: util.month(time),
    //   daystart: util.day(time),
    //   startday: time
    // })
  },

  yesterday: function () {
    if (!this.data.haslast || this.data.networkerror || this.data.isrequesting) {
      return;
    }
    var date = util.lastDay(this.data.startday);
    var haslast = true;
    if (date.getFullYear() < this.data.bindDay.getFullYear()) {
      haslast = false;
    } else if (date.getFullYear() == this.data.bindDay.getFullYear()) {
      if (date.getMonth() < this.data.bindDay.getMonth()) {
        haslast = false;
      } else if (date.getMonth() == this.data.bindDay.getMonth()) {
        if (date.getDate() <= this.data.bindDay.getDate()) {
          haslast = false;
        }
      }
    }

    this.setData({
      startday: date,
      categories: [],
      times: [],
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: haslast,
      hasnext: true
    });
    
    this.oneDay(date);
    // this.lineShow("lineCanvasDay");
  },

  tomorrow: function () {
    if (!this.data.hasnext || this.data.networkerror || this.data.isrequesting) {
      return;
    }
    var date = util.nextDay(this.data.startday);
    var hasnext = true;
    if (date.getFullYear() > this.data.today.getFullYear()) {
      hasnext = false;
    } else if (date.getFullYear() == this.data.today.getFullYear()) {
      if (date.getMonth() > this.data.today.getMonth()) {
        hasnext = false;
      } else if (date.getMonth() == this.data.today.getMonth()) {
        if (date.getDate() >= this.data.today.getDate()) {
          hasnext = false;
        }
      }
    }
    this.setData({
      startday: date,
      categories: [],
      times: [],
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: true,
      hasnext: hasnext
    });
    this.oneDay(date);
  },

  oneWeek: function (time) {
    var validDay = 7;
    var date = new Date(time);
    var dValid = Math.ceil((date - this.data.bindDay) / oneDaySeconds);
    this.setData({
      validDay: dValid > validDay ? validDay : dValid
    })
    // var orgtime = new Date(time)
    // var validDay = this.calVaildDays(orgtime, this.data.bindDay)
    // validDay = validDay > 7 ? 7 : validDay
    // this.setData({
    //   validDay: validDay
    // })
    let datearr = util.getDates(7, this.data.validDay, time);
    var week = [];
    datearr.forEach((item, index, arr) => { // item为arr的元素，index为下标，arr原数组
      var dataArr = [item.week, item.time];
      week.push(dataArr);
      let date = new Date();
      date.setFullYear(item.year);
      date.setMonth(item.month - 1);
      date.setDate(item.dayFormate);
      if (index == 0) {
        this.setData({
          yearstart: item.year,
          monthstart: item.month,
          daystart: item.dayFormate,
          startday: date
        });
      } else if (item.index == index) {
        this.setData({
          yearend: item.year,
          monthend: item.month,
          dayend: item.dayFormate,
          endday: date
        });
      }
    });
    this.setData({
      categories: week,
    })
    this.requestWeekSmokeDataFromService();
  },

  lastWeek: function () {
    if (!this.data.haslast || this.data.networkerror || this.data.isrequesting) {
      return;
    }
  
    var startday = util.lastTime(this.data.startday, 7),
      endday= util.lastTime(this.data.endday, 7);
    var haslast = true;
    if (startday < this.data.bindDay && this.data.bindDay < endday) {
      haslast = false;
    }
    this.setData({
      startday: startday,
      endday: endday,
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: haslast,
      hasnext: true
    });
    this.oneWeek(this.data.endday);
    //this.lineShow(lineChartWeek, "lineCanvasWeek");
  },

  nextWeek: function () {
    if (!this.data.hasnext || this.data.networkerror || this.data.isrequesting) {
      return;
    }
    var startday = util.nextTime(this.data.startday, 7),
      endday = util.nextTime(this.data.endday, 7);
    var hasnext = true;

    if (startday < this.data.today && this.data.today < endday) {
      hasnext = false;
    }
    this.setData({
      startday: startday,
      endday: endday,
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: true,
      hasnext: hasnext
    });
    this.oneWeek(this.data.endday);
    //this.lineShow(lineChartWeek, "lineCanvasWeek");
  },

  oneMonth: function (time) {
    var validDay = 30;
    var date = new Date(time);
    var dValid = Math.ceil((date - this.data.bindDay) / oneDaySeconds);
    this.setData({
      validDay: dValid > validDay ? validDay : dValid
    })
    let datearr = util.getDates(30, this.data.validDay, time);
    var onemonth = true;
    if (datearr[0].month != datearr[datearr.length - 1].month) {
      onemonth = false;
    }
    this.setData({
      onemonth: onemonth
    });
    var month = [];
    datearr.forEach((item, index, arr) => { // item为arr的元素，index为下标，arr原数组
      month.push(item.time);
      let date = new Date();
      date.setFullYear(item.year);
      date.setMonth(item.month - 1);
      date.setDate(item.dayFormate);
      if (index == 0) {
        this.setData({
          yearstart: item.year,
          monthstart: item.month,
          daystart: item.dayFormate,
          startday: date
        });
      } else if (item.index == index) {
        this.setData({
          yearend: item.year,
          monthend: item.month,
          dayend: item.dayFormate,
          endday: date
        });
      }
    });
    // var random1 = Math.floor(Math.random() * (500 - 50 + 1) + 50),
    //   random2 = Math.floor(Math.random() * (800 - 100 + 1) + 100),
    //   random3 = Math.floor(Math.random() * (1000 - 200 + 1) + 200),
    //   random4 = Math.floor(Math.random() * (300 - 10 + 1) + 10),
    //   random5 = Math.floor(Math.random() * (600 - 300 + 1) + 300),
    //   random6 = Math.floor(Math.random() * (600 - 300 + 1) + 150),
    //   random7 = Math.floor(Math.random() * (600 - 300 + 1) + 250);
    this.setData({
      categories: month,
      //times: [random1, random2, random3, random4, random5, random6, random7]
    })
    this.requestMonthSmokeDataFromService();
  },

  lastMonth: function () {
    //console.log(this.data.startday);
    // var startDaysOfMonth = util.getDaysOfMonth(this.data.startday, 1),
    //   endDaysOfMonth = util.getDaysOfMonth(this.data.endday, 1);
    if (!this.data.haslast || this.data.networkerror || this.data.isrequesting) {
      return;
    }

    var startday = util.lastTime(this.data.startday, 30),
      endday = util.lastTime(this.data.endday, 30);
    var haslast = true;
    if (startday < this.data.bindDay && this.data.bindDay < endday) {
      haslast = false;
    }
    this.setData({
      startday: startday,
      endday: endday,
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: haslast,
      hasnext: true
    });
    this.oneMonth(this.data.endday);
    //this.lineShow(lineChartMonth, "lineCanvasMonth");
  },

  nextMonth: function () {
    // var startDaysOfMonth = util.getDaysOfMonth(this.data.startday, 0),
    //   endDaysOfMonth = util.getDaysOfMonth(this.data.endday, 0);
    if (!this.data.hasnext || this.data.networkerror || this.data.isrequesting) {
      return;
    }
    var startday = util.nextTime(this.data.startday, 30),
      endday = util.nextTime(this.data.endday, 30);
    var hasnext = true;

    if (startday < this.data.today && this.data.today < endday) {
      hasnext = false;
    }
    this.setData({
      startday: startday,
      endday: endday,
      canbeshow: false,
      nodata: true,
      syncdata: true,
      haslast: true,
      hasnext: hasnext
    });
    this.oneMonth(this.data.endday);
    //this.lineShow(lineChartMonth, "lineCanvasMonth");
  },

  lineShow: function (lineChart, canvasId) {
      let line = {
        canvasId: canvasId, // canvas-id
        type: 'line', // 图表类型，可选值为pie, line, column, area, ring
        categories: this.data.categories,
        series: [{ // 数据列表
          name: '',
          data: this.data.times,
          color: '#31BFBF'
        }],
        xAxis: {
          disableGrid: false,
          gridColor: '#979797',
          fontColor: '#919191',
          type: 'calibration'
        },
        yAxis: {
          min: 0, // Y轴起始值
          max: this.data.smokeMax, //Y轴最大值
          disabled: true,
          disableGrid: true,
          gridColor: 'red',
          fontColor: 'blue'
        },

        width: 680 / 750 * this.data.windowWidth,
        height: 590 / 750 * this.data.windowWidth,
        //dataLabel: true, // 是否在图表中显示数据内容值
        legend: false, // 是否显示图表下方各类别的标识
        day: canvasId == 'lineCanvasDay',
        week: canvasId == 'lineCanvasWeek',
        month: canvasId == 'lineCanvasMonth',
        dataPointShape: canvasId == 'lineCanvasMonth' ? false : true,
        dataLabel: canvasId == 'lineCanvasMonth' ? false : true,
        animation: false,
        extra: {
          lineStyle: 'straight' // (仅对line, area图表有效) 可选值：curve曲线，straight直线 (默认)
        }
      }
      lineChart = new wxCharts(line);
    
    

    // const ctx = wx.createCanvasContext(canvasId, lineChart)
    // console.log(ctx);

    // // Create linear gradient
    // const grd = ctx.createLinearGradient(0, 0, 2000, 0)
    // grd.addColorStop(0, 'red')
    // grd.addColorStop(1, 'white')

    // // Fill with gradient
    // ctx.setFillStyle(grd)
    // ctx.fill()
    // ctx.draw()
    return lineChart;
  },

  /*createSimulationData: function() {
    var categories = [];
    var data = [];
    for (var i = 0; i < 10; i++) {
      categories.push('2016-' + (i + 1));
      data.push(Math.random() * (20 - 10) + 10);
    }
    return {
      categories: categories,
      data: data
    }
  },

  initWXChart: function(lineChart, simulationData, windowWidth, canvasId) {
    lineChart = new wxCharts({
      canvasId: canvasId,
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '成交量1' + canvasId,
        data: simulationData.data,
        format: function(val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        title: '成交金额 (万元)',
        format: function(val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'straight'
      }
    });
  },*/

  swichNav: function(t) {
    console.log("t:" +JSON.stringify(t));
    var currentPage = this;
    var tab = t.currentTarget.dataset.current;
    if (this.data.currentTab === tab) {
      return !1;
    }
    currentPage.setData({
      currentTab: tab
    });

    var haslast = true;
    var date = new Date();
    var copydate = new Date();
    if (tab == 0) {
      if (date.getFullYear() < this.data.bindDay.getFullYear()) {
        haslast = false;
      } else if (date.getFullYear() == this.data.bindDay.getFullYear()) {
        if (date.getMonth() < this.data.bindDay.getMonth()) {
          haslast = false;
        } else if (date.getMonth() == this.data.bindDay.getMonth()) {
          if (date.getDate() <= this.data.bindDay.getDate()) {
            haslast = false;
          }
        }
      }
      this.setData({
        showday: true,
        showweek: false,
        showmonth: false,
        haslast: haslast,
        hasnext: false,
        tab_title0: 'tab_title_select',
        tab_title1: 'tab_title_default',
        tab_title2: 'tab_title_default',
        tab_title_text0: 'tab_title_text_select',
        tab_title_text1: 'tab_title_text_default',
        tab_title_text2: 'tab_title_text_default'
      })
      this.oneDay(date);
      //this.lineShow(lineChartDay, "lineCanvasDay");
    } else if (tab == 1) {
      copydate.setDate(copydate.getDate() - 7)
      if (copydate < this.data.bindDay && this.data.bindDay < date) {
        haslast = false;
      }
      this.setData({
        showday: false,
        showweek: true,
        showmonth: false,
        haslast: haslast,
        hasnext: false,
        tab_title0: 'tab_title_default',
        tab_title1: 'tab_title_select',
        tab_title2: 'tab_title_default',
        tab_title_text0: 'tab_title_text_default',
        tab_title_text1: 'tab_title_text_select',
        tab_title_text2: 'tab_title_text_default'
      })
      let time = util.formatTime(date);
      this.oneWeek(time);
      //this.lineShow(lineChartWeek, "lineCanvasWeek");
    } else {
      copydate.setDate(copydate.getDate() - 30)
      if (copydate < this.data.bindDay && this.data.bindDay < date) {
        haslast = false;
      }
      this.setData({
        showday: false,
        showweek: false,
        showmonth: true,
        haslast: haslast,
        hasnext: false,
        tab_title0: 'tab_title_default',
        tab_title1: 'tab_title_default',
        tab_title2: 'tab_title_select',
        tab_title_text0: 'tab_title_text_default',
        tab_title_text1: 'tab_title_text_default',
        tab_title_text2: 'tab_title_text_select'
      })
      let time = util.formatTime(date);
      //let daysCount = util.getDaysOfMonth(new Date(time), 1);
      this.oneMonth(time);
      //this.lineShow(lineChartMonth, "lineCanvasMonth");
    }
  },
  
  requestSmokeDateFromService () {
    const that = this;
    var bleid = null;
    if (this.data.isrequesting) {
      return
    }
    try {
      bleid = '99:99:99:99:99:99' //wx.getStorageSync('ble_deviceId')
    } catch (e) {
      console.log("===e===" + e);
    }
    var requestDay = this.data.yearstart+this.data.monthstart+this.data.daystart;
    this.setData({
      isrequesting: true,
      syncdata: true
    })
    wx.request({
      url: getSmokeDataByDate, // 仅为示例，并非真实的接口地址
      data: {
        deviceUUID: bleid,
        date: requestDay
      },
      success(res) {
        that.setData({
          smokeList: res.data.smokeList,
          isrequesting: false,
          syncdata: false
        })
        that.smokeDayPaste(that);
      },
      fail(res) {
        that.setData({
          networkerror: true,
          isrequesting: false,
          syncdata: false
        })
        wx.showModal({
          content: '网络加载失败，请检查网络后再试一次',
          showCancel: false,
          confirmColor: '#239F9F',
          success: function (res) {
            if (res.confirm) {
              that.smokeDayPaste(that);
              console.log('用户点击确定')
            }
          }
        });
      }
    })
  },

  smokeDayPaste: function() {
    var categories = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']; //时间点
    var times = new Array(25);       //抽烟数据
    times.fill(0);
    var smokeSum = 0;
    var smokeMax = 0;
    var smokeList = this.data.smokeList
    if (smokeList != null && smokeList.length > 0) {
      for (var i = 0; i < smokeList.length; i++) {
        var smokeTime = smokeList[i][1] * 1000,
          smokeCount = smokeList[i][2];
        smokeSum += smokeCount;
        var date = new Date(smokeTime);
        var hour = date.getHours();
        var minute = date.getMinutes();
        if (minute > 0) {
          hour++;
        }
        times[hour] = smokeCount;
        if (smokeCount > smokeMax) {
          smokeMax = smokeCount
        }
      }
      this.setData({
        smokeMax: smokeMax + 10 + smokeMax / 8
      })
      var branch = (smokeSum / 14).toFixed(2)
      var packet = (branch / 20).toFixed(2);
      this.setData({
        categories: categories,
        smokeSum: smokeSum,
        branch: branch,
        packet: packet,
        times: times,
        nodata: false,
        syncdata: false
      })
    } else {
      this.setData({
        categories: categories,
        smokeSum: '--',
        branch: '--',
        packet: '--',
        times: times,
        nodata: true,
        syncdata: false,
      })
    }
    lineChartDay = this.lineShow(lineChartDay, "lineCanvasDay");
  },

  requestWeekSmokeDataFromService: function() {
    const that = this;
    var bleid = null;
    if (this.data.isrequesting) {
      return
    }
    try {
      bleid = '99:99:99:99:99:99' //wx.getStorageSync('ble_deviceId')
    } catch (e) {
      console.log("===e===" + e);
    }
    this.setData({
      isrequesting: true,
      syncdata: true
    })
    var startDay = this.data.yearstart + this.data.monthstart + this.data.daystart;
    var endDay = this.data.yearend + this.data.monthend + this.data.dayend;
    wx.request({
      url: getSmokeData, // 仅为示例，并非真实的接口地址
      data: {
        deviceUUID: bleid,
        startDate: startDay,
        endDate: endDay
      },
      success(res) {
        that.setData({
          smokeList: res.data.smokeList,
          isrequesting: false,
          syncdata: false
        })
        that.smokeWeekPaste(that);
      },
      fail(res) {
        that.setData({
          networkerror: true,
          isrequesting: false,
          syncdata: false
        })
        wx.showModal({
          content: '网络加载失败，请检查网络后再试一次',
          showCancel: false,
          confirmColor: '#239F9F',
          success: function (res) {
            if (res.confirm) {
              that.smokeWeekPaste(that);
              console.log('用户点击确定')
            }
          }
        });
      }
    })
  },

  smokeWeekPaste: function() {
    var times = new Array(7);       //抽烟数据
    times.fill(0);
    var smokeSum = 0;
    var smokeMax = 0;
    var smokeList = this.data.smokeList;
    var smokeTime = [],
      smokeCount = [];
    if (smokeList != null && smokeList.length > 0) {
      for (var i = 0; i < smokeList.length; i++) {
        smokeTime[i] = smokeList[i][0];
        smokeCount[i] = smokeList[i][1];
        smokeSum += smokeCount[i];
        if (smokeCount[i] > smokeMax) {
          smokeMax = smokeCount[i]
        }
      }
      this.setData({
        smokeMax: smokeMax + 10 + smokeMax / 8
      })
      for(var j = 0; j < this.data.categories.length; j++) {
        var day = this.data.categories[j][1].replace('.', '');
        for (var k = 0; k < smokeTime.length ;k ++) {
          if (smokeTime[k].substr(-4) === day) {
            times[j] = smokeCount[k];
          }
        }
      }
      var branch = (smokeSum / 14).toFixed(2)
      var packet = (branch / 20).toFixed(2);
      this.setData({
        times: times,
        smokeSum: smokeSum,
        branch: branch,
        packet: packet,
        nodata: false,
        syncdata: false
      })
    } else {
      this.setData({
        times: times,
        smokeSum: '--',
        branch: '--',
        packet: '--',
        nodata: true,
        syncdata: false,
      })
    }
    var that = this;
    setTimeout(function () {
      //要延时执行的代码
      lineChartWeek = that.lineShow(lineChartWeek, "lineCanvasWeek");
    }, 100) //延迟时间 这里是0.1秒
    
  },

  requestMonthSmokeDataFromService: function () {
    const that = this;
    var bleid = null;
    if (this.data.isrequesting) {
      return
    }
    try {
      bleid = '99:99:99:99:99:99' //wx.getStorageSync('ble_deviceId')
    } catch (e) {
      console.log("===e===" + e);
    }
    this.setData({
      isrequesting: true,
      syncdata: true
    })
    var startDay = this.data.yearstart + this.data.monthstart + this.data.daystart;
    var endDay = this.data.yearend + this.data.monthend + this.data.dayend;
    wx.request({
      url: getSmokeData, // 仅为示例，并非真实的接口地址
      data: {
        deviceUUID: bleid,
        startDate: startDay,
        endDate: endDay
      },
      success(res) {
        that.setData({
          smokeList: res.data.smokeList,
          isrequesting: false,
          syncdata: false
        })
        that.smokeMonthPaste(that);
      },
      fail(res) {
        that.setData({
          networkerror: true,
          isrequesting: false,
          syncdata: false
        })
        wx.showModal({
          content: '网络加载失败，请检查网络后再试一次',
          showCancel: false,
          confirmColor: '#239F9F',
          success: function (res) {
            if (res.confirm) {
              that.smokeMonthPaste(that);
              console.log('用户点击确定')
            }
          }
        });
      }
    })
  },

  smokeMonthPaste: function () {
    var times = new Array(this.data.categories.length);       //抽烟数据
    times.fill(0);
    var smokeSum = 0;
    var smokeMax = 0;
    var smokeList = this.data.smokeList;
    var smokeTime = [],
      smokeCount = [];
    if (smokeList != null && smokeList.length > 0) {
      for (var i = 0; i < smokeList.length; i++) {
        smokeTime[i] = smokeList[i][0];
        smokeCount[i] = smokeList[i][1];
        smokeSum += smokeCount[i];
        if (smokeCount[i] > smokeMax) {
          smokeMax = smokeCount[i]
        }
      }
      this.setData({
        smokeMax: smokeMax + 10 + smokeMax / 8
      })
      for (var j = 0; j < this.data.categories.length; j++) {
        var day = this.data.categories[j].replace('.', '');
        for (var k = 0; k < smokeTime.length; k++) {
          if (smokeTime[k].substr(-4) === day) {
            times[j] = smokeCount[k];
          }
        }
      }
      var branch = (smokeSum / 14).toFixed(2)
      var packet = (branch / 20).toFixed(2);
      this.setData({
        times: times,
        smokeSum: smokeSum,
        branch: branch,
        packet: packet,
        nodata: false,
        syncdata: false
      })
    } else {
      this.setData({
        times: times,
        smokeSum: '--',
        branch: '--',
        packet: '--',
        nodata: true,
        syncdata: false,
      })
    }
    var that = this;
    setTimeout(function () {
      //要延时执行的代码
      lineChartMonth = that.lineShow(lineChartMonth, "lineCanvasMonth");
    }, 100) //延迟时间 这里是0.1秒
  },
  
  onPullDownRefresh: function () {
    this.setData({
      nodata: true,
      syncdata: true
    });
    if (this.data.currentTab == 0) {
      this.requestSmokeDateFromService()
    } else if (this.data.currentTab == 1) {
      this.requestWeekSmokeDataFromService()
    } else if (this.data.currentTab == 2) {
      this.requestMonthSmokeDataFromService()
    }
    wx.stopPullDownRefresh();
  },
})