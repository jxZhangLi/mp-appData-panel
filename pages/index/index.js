// index.js

Page({
  components: ['pagelog', 'pagehome', 'sub'],
  name: 'index root',
  data: {
    obj: {
      parent: 'root data'
    }
  },

  onLoad() {
    console.log('parents onload')
    // this.selectComponent('#home').__onLoad__()
    const _this = this
    var val = null
    // Object.defineProperty(this.data, 'obj', {
    //   // value: this.data.parent,
    //   configurable: true,
    //   enumerable: true,
    //   // writable: true,
    //   get () {
    //     console.log('get parent')
    //     return val
    //   },
    //   set (value) {
    //     console.log('set parent value', value)
    //     val = value
    //   }
    // });

    // setTimeout(() => {
    //   // console.log(this.data)
    //   // this.data.parent = 1
    //   this.setData({ obj: { parent: 1 } })
    // })
  },
  
})
