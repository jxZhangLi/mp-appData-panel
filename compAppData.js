export function ConnectedAppData() {
  const _Page = Page
  const _Component = Component
  const COMPONENT_MAP = {}

  let compTreeList = {}
  let createdList = []
  let attachedList = []
  let compQueue = []

  function clearLifecycle() {
    createdList = []
    attachedList = []
  }

  Page = function(options) {
    const { name = "root", components } = options

    if (Array.isArray(components)) {
      const pageOnload = options.onLoad
      const pageUnload = options.onUnload

      options.onLoad = function(options) {
        const compContext = this

        pageOnload && pageOnload.call(compContext, options)
        compContext.__COMPNAME__= name
        compContext.__COMPCONENTS__ = components
        COMPONENT_MAP[compContext.__wxExparserNodeId__] = compContext
        
        const pageId = compContext.getPageId()
        compTreeList[pageId] = buildAstTree(compContext, createdList, attachedList)

        console.log(compTreeList)
        
        setComponentData(compTreeList[pageId])

        clearLifecycle()
      }

      options.onUnload = function() {
        console.log('page.onUnload')
        const compContext = this
        const pageId = compContext.getPageId()

        pageUnload && pageUnload.call(compContext)

        delete compTreeList[pageId]
      }
    }
    
    _Page(options)
  }

  Component = function(options) {
    const { name = "root", components = [] } = options
    
    if (name) {
      !options.methods && (options.methods = {})
      const compOnLoad = options.methods.onLoad
      const compUnload = options.methods.onUnload
      const compCreated = options.created
      const compAttached = options.attached
      const compDetached = options.detached

      options.methods.onLoad = function() {
        const compContext = this

        compOnLoad && compOnLoad.call(compContext)

        // Component 化页面时，需要剔除根组件
        if (attachedList[0].onShow) {
          createdList.pop()
          attachedList.shift()
        }

        const pageId = compContext.getPageId()
        compTreeList[pageId] = buildAstTree(compContext, createdList, attachedList)

        console.log(compTreeList)
        
        setComponentData(compTreeList[pageId])

        clearLifecycle()
      }

      options.methods.onUnload = function() {
        const compContext = this
        const pageId = compContext.getPageId()

        compUnload && compUnload.call(compContext)

        delete compTreeList[pageId]
      }

      options.created = function() {
        const compContext = this

        compCreated && compCreated.call(compContext)

        createdList.push(compContext)
      }

      options.attached = function() {
        const compContext = this
        compAttached && compAttached.call(compContext)

        const pageId = compContext.getPageId()

        compContext.__COMPNAME__= name
        compContext.__COMPCONENTS__ = components
        COMPONENT_MAP[compContext.__wxExparserNodeId__] = compContext

        if (compTreeList[pageId]) {
          let pInstance = parentFallback(name)
          const { __COMPCONENTS__: pComponents } = pInstance

          // 监听数据
          for (let key in compContext.data) {
            defineReactive.call(compContext, compContext.data, key)
          }

          // todo：待优化
          if (pComponents.indexOf(name) !== -1) {
            // 动态组件情况
            const compName = createCompName(name, compContext.__wxExparserNodeId__)

            wx.nextTick(() => {
              compContext.parent = pInstance
              pInstance.setData({
                [compName]: compContext.data
              })

              defineReactive.call(pInstance, pInstance.data, compName)

              // 更新父级
              while (pInstance.parent) {
                const compName = createCompName(pInstance.__COMPNAME__, pInstance.__wxExparserNodeId__)

                pInstance.parent.setData({
                  [compName]: pInstance.data
                })

                pInstance = pInstance.parent
              }
            })
 
            if (components.length) {
              compQueue.push(compContext)
            }
          }
        } else {
          attachedList.push(compContext)
        }
      }

      options.detached = function() {
        const compContext = this
        const pageId = compContext.getPageId()

        compDetached && compDetached.call(compContext)

        if (!compTreeList[pageId]) {
          return
        }

        const deleteId = compContext.__wxExparserNodeId__
        const deleteName = createCompName(name, deleteId)

        // 必须在 nexttick 后，否则无法删除
        wx.nextTick(() => { 
          delete COMPONENT_MAP[deleteId]
          delete compContext.parent.data[deleteName]

          // 修改当前数据后，向上寻找父级更新
          let parnetComp = compContext.parent
          let delKeys = [deleteName]
          while (parnetComp) {
            const compName = createCompName(parnetComp.__COMPNAME__, parnetComp.__wxExparserNodeId__)
            
            if (parnetComp.parent) {
              delKeys.push(compName)
            } else {
              // console.log(delKeys)
              const pageId = parnetComp.getPageId()
              let root = compTreeList[pageId].cur.data
              for (let i = delKeys.length - 1; i > 0; i--) {
                root = root[delKeys[i]]
              }
              delete root[delKeys[0]]
              // console.log(root, compTreeList.cur.data)
            }
            parnetComp = parnetComp.parent            
          }
        })
      
      }
    }

    _Component(options)
  }

  function defineReactive(obj, key) {
    const compContext = this
    let value = obj[key]

    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      // writable: true,
      get () {
        return value
      },
      set (newVal) {
        if (newVal === value) {
          return
        }
        // v-if 情况，收集当前替换的节点触发位置
        compQueue = [compContext]

        const compInstance = COMPONENT_MAP[getCompId(key)]

        // console.log('setvalue', key, newVal, value)
        
        // data[key] == getCompId(key) 存在情况
        if (compInstance && getCompId(key) !== key) {
          const saveKeys = deepDiff(value, newVal)
          // console.log('需要更新数据的[key]', saveKeys)

          if (saveKeys.length) {
            saveKeys.forEach(saveKey => {
              // 修改父组件中子组件数据后，自动触发子组件实例更新
              compInstance.data[saveKey] = newVal[saveKey]
            })
          }
          value = newVal
        } else {
          // 这里必须提前赋值，否则无法更新
          value = newVal
          compContext.setData({
            [key]: newVal
          })
        }
      }
    });
  }
  function isType(data) {
    const type = Object.prototype.toString.call(data)
     return type ? type.slice(1, -1).split(' ')[1] : ''
  }

  function deepDiff(oldData, newData) {
    const resKey = []

    if (oldData === newData) {
      return resKey
    }

    if (isType(oldData) !== isType(newData)) {
      return Object.keys(newData)
    }

    if (Array.isArray(oldData) && Array.isArray(newData)) {
      if (oldData.length === newData.length) {
        const changed = []
        for (let i = 0, len = newData.length; i < len; i++) {
          // 递归处理，处理数据中包含数据或者包含对象的情况
          const keys = deepDiff(oldData[i], newData[i])
          if (keys.length) {
            changed.push(i)
          }
        }
        return changed
      } else {
        return Object.keys(newData)
      }
    }

    if (isType(oldData) === 'Object' && isType(newData) === 'Object') {
      const newKeys = Object.keys(newData)
      const oldKeys = Object.keys(oldData)
      const uniqueKeys = new Set([...newKeys, ...oldKeys])
      
      uniqueKeys.forEach(itemKey => {
        if (isType(newData[itemKey]) === 'Object') {
          const keys = deepDiff(oldData[itemKey], newData[itemKey])
          
          if (keys.length) {
            resKey.push(itemKey)
          }
        } else if (Array.isArray(newData[itemKey])) {
          const keys = deepDiff(oldData[itemKey], newData[itemKey])

          if (keys.length) {
            resKey.push(itemKey)
          }
        } else if (oldData[itemKey] !== newData[itemKey]) {
          resKey.push(itemKey)
        }
      })
    }

    return resKey
  }

  function createCompName(name, id) {
    return `__${ name }_${ id }`
  }
  function getCompId(key) {
    return key.slice(-8)
  }

  // 组件生命周期对比算法（构建出组件树关系）
  function buildAstTree(compParent, cList, aList) {
    const tree = {
      cur: compParent,
      compName: compParent.__COMPNAME__,
      components: compParent.__COMPCONENTS__,
      children: []
    }
    let i = 0, j = 0

    while (i < aList.length) {

      if (i === j && cList[j] === aList[i]) {
        tree.children.push({
          cur: aList[i],
          compName: aList[i].__COMPNAME__,
          components: aList[i].__COMPCONENTS__,
          children: []
        })
        i++
        j++
      } else if (cList[j] !== aList[i]) {
        j++
      } else {
        const sliceCList = cList.slice(i, j)
        const sliceAList = aList.slice(i + 1, j + 1)

        const ast = buildAstTree(aList[i], sliceCList, sliceAList)
        
        tree.children.push(ast)

        j++
        i = j
      }
    }

    return tree
  }

  function setComponentData(ast) {
    const { cur: parentInstance, components, children } = ast

    // 监听数据
    for (let key in parentInstance.data) {
      defineReactive.call(parentInstance, parentInstance.data, key)
    }

    children.forEach(child => {
      const { cur: childInstance, compName } = child

      if (components.indexOf(compName) !== -1) {

        const childId = childInstance.__wxExparserNodeId__
        const compKey = createCompName(compName, childId)

        // 父组件与子组件数据关联
        parentInstance.setData({
          [compKey]: childInstance.data
        })
        // id => 实例
        COMPONENT_MAP[childId] = childInstance
        // 子组件关联到父组件
        childInstance.parent = parentInstance

        defineReactive.call(parentInstance, parentInstance.data, compKey)

        setComponentData(child)
      }
    })
  }

  function parentFallback(curName) {
    let lastComp = compQueue[compQueue.length - 1]

    while (lastComp.__COMPCONENTS__.indexOf(curName) === -1) {
      lastComp = compQueue.pop()
    }

    return lastComp
  }

}
