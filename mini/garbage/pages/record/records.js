// pages/record/records.js
const WXAPI = require('../../wxapi/main')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:0,
    points:[
      { id: 1, date: "2019年5月4日", way: "答题", point: 10 },
      { id: 2, date: "2019年5月4日", way: "答题", point: 10 },
      { id: 3, date: "2019年5月4日", way: "答题", point: 10 }
    ],
    bags: [
      { id: 1, date: "2019年5月4日", type: "干" },
      { id: 2, date: "2019年5月4日", type: "湿" },
      { id: 3, date: "2019年5月4日", type: "湿" }
    ],
    recycles: [
      { id: 1, date: "2019年5月4日", type: "金属", weight: "2kg", point: 10 },
      { id: 2, date: "2019年5月4日", type: "纺织物", weight: "2kg", point: 10 },
      { id: 3, date: "2019年5月4日", type: "纸张", weight: "1kg", point: 10 }
    ],
    currentPage: 0,
    pageSize: 10,
    pageCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options || !options.type) {
      wx.switchTab({
        url: '/pages/me/me',
      });
      return;
    }
    this.setData({
      type: options.type
    })
    console.log("type:", this.data.type)
    if (this.data.type == 2) {
      wx.setNavigationBarTitle({
        title: "取袋记录"
      })
    } else if (this.data.type == 3) {
      wx.setNavigationBarTitle({
        title: "投递记录"
      })
    } else {
      wx.setNavigationBarTitle({
        title: "积分查询"
      })
    }
    this.loadRecords()
  },
  /**
   * 通过服务器查询相关记录
   */
  loadRecords: function() {
    let that = this
    if (this.data.type == 1) {
      this.loadScoreHistory()
    } else if (this.data.type == 2) {
      this.loadBagHistory()
    } else if (this.data.type == 3) {
      this.loadRecycleHistory()
    }
  },
  loadScoreHistory: function() {
    let that = this
    WXAPI.getScoreHistory({
      loginToken: app.globalData.loginToken,
      page: this.data.currentPage,
      pageSize: this.data.pageSize
    }).then(function (res) {
      console.log("res:", res)
      if (res.status && res.status == 200) {
        var historyList = null
        try {
          historyList = JSON.parse(res.historyList)
        } catch(err) {
          historyList = res.historyList
        }
        that.setData({
          points: historyList,
          pageCount: res.pageCount
        })
      } else if (res.msg && res.msg.indexOf(":ok") < 0) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  },
  loadBagHistory: function () {
    let that = this
    WXAPI.getBagHistory({
      loginToken: app.globalData.loginToken,
      page: this.data.currentPage,
      pageSize: this.data.pageSize
    }).then(function (res) {
      console.log("res:", res)
      if (res.status && res.status == 200) {
        var historyList = null
        try {
          historyList = JSON.parse(res.historyList)
        } catch (err) {
          historyList = res.historyList
        }
        that.setData({
          bags: historyList,
          pageCount: res.pageCount
        })
      } else if (res.msg && res.msg.indexOf(":ok") < 0) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  },
  loadRecycleHistory: function () {
    let that = this
    WXAPI.getRecycleHistory({
      loginToken: app.globalData.loginToken,
      page: this.data.currentPage,
      pageSize: this.data.pageSize
    }).then(function (res) {
      console.log("res:", res)
      if (res.status && res.status == 200) {
        var historyList = null
        try {
          historyList = JSON.parse(res.historyList)
        } catch (err) {
          historyList = res.historyList
        }
        that.setData({
          recycles: historyList,
          pageCount: res.pageCount
        })
      } else if (res.msg && res.msg.indexOf(":ok") < 0) {
        wx.showToast({
          icon: "none",
          title: res.msg
        })
      } else {
        app.showWebError(res)
      }
    })
  }, 
  prePage:function(e) {
    if (this.data.currentPage != 0) {
      this.setData({
        currentPage: this.data.currentPage -1
      })
      this.loadRecords()
    }
  },
  nextPage: function (e) {
    if (this.data.currentPage + 1 != this.data.pageCount) {
      this.setData({
        currentPage: this.data.currentPage + 1
      })
      this.loadRecords()
    }
  }
})