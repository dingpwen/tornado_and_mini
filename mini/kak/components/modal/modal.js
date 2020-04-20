// components/modal/modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:String,
    confirm: String,
    hidden: Boolean,
    nocancel: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCancel: function () {
      const myEventDetail = { tapEvt: "cancel" } // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
    onConfirm: function () {
      const myEventDetail = {tapEvt:"confirm"} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
    preventTouchMove: function () {
    },
  }
})
