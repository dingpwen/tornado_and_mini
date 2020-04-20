// pages/recycle/recycleResult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryName: "",
    weight: 10,
    score: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type) {
      var type = options.type
      var names = ["塑料", "金属", "纸张", "纺织品", "有害垃圾"]
      if (type > 0 && type < 6) {
        this.setData({
          categoryName: names[type - 1]
        })
      }
    } else if (options.categoryName) {
      this.setData({
        categoryName: options.categoryName
      })
    }
    if (options.weight) {
      this.setData({
        weight: options.weight
      })
    }
    if (options.score) {
      this.setData({
        score: options.score
      })
    }
  },
  /**
   * 跳转到记录界面，type:1,积分记录; 2, 取袋记录; 3, 投递记录
   */
  viewRecord: function (e) {
    wx.navigateTo({
      url: '/pages/record/records?type=3'
    })
  },
  /**
   * 退出跳转到主页
   */
  doExit: function (e) {
    wx.switchTab({
      url: '/pages/life/life'
    })
  }
})