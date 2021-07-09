import { ConnectedAppData } from './compAppData'

new ConnectedAppData()

// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})



      //   if (!COMPONENT_MAP[name]) {
      //     COMPONENT_MAP[name] = []
      //   }

      //   // 可能出现一个组件多种实例情况
      //   COMPONENT_MAP[name].push(compContext)

      //   // 组件嵌套组件情况
      //   if (components.length) {
      //     const parents = COMPONENT_MAP[name] || []

      //     parents.forEach(parent => {
      //       // 多组件情况: finish 过滤掉已经收集完成依赖实例
      //       if (parent.__finish__) {
      //         return
      //       }
      //       parent.__finish__ = true

      //       components.forEach(component => {
      //         const childs = COMPONENT_MAP[component]

      //         childs && childs.forEach(child => {
      //           const childId = child.__wxExparserNodeId__
      //           const compName = createCompName(component, childId)
      //           // 父组件与子组件数据关联
      //           // parent.data[compName] = child.data
      //           parent.setData({
      //             [compName]: child.data
      //           })
      //           // id => 实例
      //           COMPONENT_MAP[childId] = child
      //           // 子组件关联到父组件
      //           child.parent = compContext
      //         })
      //         // 清除子组件依赖
      //         COMPONENT_MAP[component] = []
      //         // 标记组件树引用
      //         COMPONENT_MAP[component].parent = name
      //       })
      //     })

      //   }

      //   // 监听数据
      //   for (let key in compContext.data) {
      //     defineReactive.call(compContext, compContext.data, key)
      //   }