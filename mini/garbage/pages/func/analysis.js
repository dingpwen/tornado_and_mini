// pages/func/analysis.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    questionList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      questionList: JSON.parse(options.questionList)
    })
    console.log(this.data.questionList)
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

  pasteQuestionsList: function () {
    var questionList = this.data.questionList
    var dataList = []
    questionList.forEach((item, index, arr) => { // item为arr的元素，index为下标，arr原数组
      var question = item.question
      var analysis = item.analysis
      var optionArray = item.optionArray
      console.log(item); // 1, 2, 3
      console.log(index); // 0, 1, 2
      console.log(arr); // [1, 2, 3]
      console.log(question);
      console.log(analysis);
      console.log(optionArray);
      var data = { text: question, chooseItem: optionArray, comment: analysis}
      console.log(data);
      dataList.push(data)
    });
    this.setData({
      dataList: dataList
    })
  }
})