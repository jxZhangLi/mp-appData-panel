## AppData panel 插件功能特点：

- [ ] vue 类框架小程序
- [x] 1、支持原生
- [x] 2、支持 page、component 页面级别
- [x] 3、复杂(多)组件嵌套子组件双向数据展示
- [x] 4、if 指令动态切换组件展示

![87e42b7d-1fae-40e1-a5d8-30cb6d362e8f](https://user-images.githubusercontent.com/16809535/125049173-4842f100-e0d3-11eb-8af8-bd7de0362ace.png)


## 配置

```js
Page({
  name: 'pagehome',
  components: ['pagelog', 'sub'],
})
```

```js
Component({
  name: 'pagehome',
  components: ['pagelog', 'sub'],
})
```

#### 小程序限制

- 父组件无法获取全部的子组件，子组件也无法获取父组件

https://developers.weixin.qq.com/community/develop/doc/00020ea71e87e01fc3e8e5dff52000

