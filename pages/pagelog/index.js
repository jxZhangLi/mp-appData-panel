// pages/index/components/index.js
// 获取应用实例
const app = getApp()

Component({
  components: ['sub'],
  name: 'pagelog',
  options: {
    styleIsolation: 'apply-shared'
  },
  created() {
    // console.log(this)
  },
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
    motto: 'Hello page log',
    list: [{ a: 1},{ a: 2},{ a: 3 }]
  },
  
  created() {
    // setTimeout(() => {
    //   console.log('cccc')
    //   const self = this
    //   this.data.list.push({ a: 4 })

    //   this.setData({ list: self.data.list })
    // }, 1000)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad() {
      console.log('log component onload')
    },
  
  }
})
