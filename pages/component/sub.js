// pages/index/component/sub.js
Component({
  name: 'sub',
  components: ['test'],
  /**
   * 组件的属性列表
   */
  properties: {
    name: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    sub: 'sub data',
    toggle: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindToggle() {
      this.setData({
        toggle: !this.data.toggle
      })
    }
  }
})
