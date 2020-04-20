// pages/func/answer.js
const WXAPI = require('../../wxapi/main')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: "测试题",
    number: 1,
    answerCard: [],
    questiongsList: [],
    optionArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      questiongsList: JSON.parse(options.questions)
    })
    this.pasteQuestionsList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  pasteQuestionsList: function() {
    var question = this.data.questiongsList[this.data.number - 1].question
    var optionArray = this.data.questiongsList[this.data.number - 1].optionArray
    this.setData({
      text: question,
      optionArray: optionArray
    })
  },

  last: function () {
    this.setData({
      number: this.data.number - 1
    })
    this.pasteQuestionsList()
  },

  next: function () {
    this.setData({
      number: this.data.number + 1
    })
    this.pasteQuestionsList()
  },

  commit: function () {
    var arr = this.data.answerCard;
    for (var j = 0, len = 10; j < len; j++) {
      if (!arr[j]) {
        wx.showModal({
          content: '第' + (j + 1) + '题还未作答，请继续完成。',
          showCancel: false,
          confirmColor: '#239F9F',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        });
        return;
      }
      console.log(len);
    }

    var answerCard = this.data.answerCard;
    var answerStr = "";
    for (var i = 0; i < answerCard.length; i++) {

    }
    answerCard.forEach((item, index, arr) => { // item为arr的元素，index为下标，arr原数组
      console.log(item); // 1, 2, 3
      console.log(index); // 0, 1, 2
      console.log(arr); // [1, 2, 3]
      if (index != 0) {
        answerStr += ','
      }
      answerStr += item
    });
    answerStr = JSON.stringify(answerStr).substr(1, answerStr.length)
    console.log(answerStr)
    WXAPI.submitAnswer({
      loginToken: app.globalData.loginToken,
      answerStr: answerStr
    }).then(function (res) {
      console.log(res)
      wx.redirectTo({
        url: '/pages/func/score?score=' + res.score + '&hint=' + res.hint + '&questionList=' + JSON.stringify(res.questionList)
      })
    })
  },

  choose: function (e) {
    console.log(e.currentTarget.dataset.choose)
    var num = Number(e.currentTarget.dataset.choose);
    console.log(num)
    var tempAnswerCard = this.data.answerCard;
    var choose = String.fromCharCode(65 + num);
    console.log(choose)
    tempAnswerCard[this.data.number - 1] = choose;
    this.setData({
      answerCard: tempAnswerCard
    })
    console.log(this.data.answerCard)
  },
})