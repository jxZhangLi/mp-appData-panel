// logs.js
const util = require('../../utils/util.js')

Page({
  name: 'log root',
  components: ['sub'],
  data: {
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
  },
  logfn() {}
})
