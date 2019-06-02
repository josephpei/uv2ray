import Vue from 'vue'
import Vuex from 'vuex'
import defaultConfig from '../shared/config'
import {
  merge,
  clone,
  request,
  isSubscribeContentValid,
  getUpdatedKeys,
  isConfigEqual,
  somePromise,
} from '../shared/utils'
import Config from '../shared/v2ray'
import { syncConfig } from './ipc'
import {
  STORE_KEY_FEATURE,
  STORE_KEY_V2RAY_SECURITIES,
  STORE_KEY_V2RAY_NETWORKS,
  STORE_KEY_V2RAY_TYPES,
  STORE_KEY_V2RAY_TLSES,
} from './constants'
import Store from 'electron-store'

Vue.use(Vuex)

// 当前编辑的配置项
const editingConfig = new Config()
// v2ray config 有效key
const configKeys = Object.keys(editingConfig)
// 页面
const views = ['Feature', 'Setup', 'ManagePanel', 'Options']
// 编辑组的名称
let groupTitleBak = ''
// 功能页面是否已展示过
const ls = new Store()
// window.localStorage
// const featureReaded = !!ls.getItem(STORE_KEY_FEATURE)
const featureReaded = !!ls.get(STORE_KEY_FEATURE)

// 初始化读取存储，如果没有存储则保持
const storedSecurities = ls.get(STORE_KEY_V2RAY_SECURITIES)
const storedNetworks = ls.get(STORE_KEY_V2RAY_NETWORKS)
const storedTypes = ls.get(STORE_KEY_V2RAY_TYPES)
const storedTlses = ls.get(STORE_KEY_V2RAY_TLSES)

let securities
let networks
let types
let tlses
// v2ray securities
if (storedSecurities) {
  securities = JSON.parse(storedSecurities)
} else {
  securities = ['none', 'auto', 'aes-128-gcm', 'chacha20-poly1305']
  ls.set(STORE_KEY_V2RAY_SECURITIES, JSON.stringify(securities))
}
// v2ray networks
if (storedNetworks) {
  networks = JSON.parse(storedNetworks)
} else {
  networks = ['tcp', 'kcp', 'ws', 'quic', 'h2']
  ls.set(STORE_KEY_V2RAY_NETWORKS, JSON.stringify(networks))
}
// v2ray stream networks
if (storedTypes) {
  types = JSON.parse(storedTypes)
} else {
  types = ['none', 'tcp', 'kcp', 'quic']
  ls.set(STORE_KEY_V2RAY_TYPES, JSON.stringify(types))
}

// v2ray stream security
if (storedTlses) {
  tlses = JSON.parse(storedTlses)
} else {
  tlses = ['none', 'tls']
  ls.set(STORE_KEY_V2RAY_TLSES, JSON.stringify(tlses))
}

export { ls }

export default new Vuex.Store({
  state: {
    appConfig: defaultConfig,
    meta: {
      version: '',
      defaultV2rayDownloadDir: '',
    },
    view: {
      page: views[2], // featureReaded ? views[1] : views[0],
      tab: 'common',
      // 是否激活当前页面的主要操作
      active: false,
    },
    editingConfig,
    // 备份当前选中的配置项
    editingConfigBak: new Config(),
    editingGroup: { show: false, title: '', updated: false },
    securities,
    networks,
    types,
    tlses,
  },
  mutations: {
    // 更新应用配置
    updateConfig (state, [targetConfig, sync = false]) {
      const changed = getUpdatedKeys(state.appConfig, targetConfig)
      console.log('fuck fuck fuck')
      console.log(changed)
      if (changed.length) {
        const extractConfig = {}
        changed.forEach(key => {
          extractConfig[key] = targetConfig[key]
        })
        merge(state.appConfig, extractConfig)
        console.log('config updated: ', extractConfig)
        if (sync) {
          syncConfig(extractConfig)
        }
      }
    },
    // 更新应用元数据
    updateMeta (state, targetMeta) {
      merge(state.meta, targetMeta)
      console.log('meta updated: ', targetMeta)
    },
    // 更改页面视图
    updateView (state, targetView) {
      merge(state.view, targetView)
    },
    // 返回上一个页面
    prevView (state) {
      state.view.page = views[views.indexOf(state.view.page) - 1]
    },
    // 下一个页面
    nextView (state) {
      state.view.page = views[views.indexOf(state.view.page) + 1]
    },
    // 设置选中的配置
    setCurrentConfig (state, v2rayConfig) {
      merge(state.editingConfig, v2rayConfig)
      merge(state.editingConfigBak, v2rayConfig)
    },
    // 更新编辑项备份
    updateEditingBak (state) {
      merge(state.editingConfigBak, state.editingConfig)
    },
    // 重置状态
    resetState (state) {
      merge(state.editingConfig, state.editingConfigBak)
      merge(state.view, {
        page: views.indexOf(state.view.page) >= 2 ? views[2] : state.view.page,
        tab: 'common',
        active: false,
      })
      state.editingGroup.title = groupTitleBak
    },
    // 更新当前编辑的组
    updateEditingGroup (state, newGroup) {
      merge(state.editingGroup, newGroup)
      groupTitleBak = newGroup.title
    },
    // 更新编辑项
    updateEditing (state, config) {
      merge(state.editingConfig, config)
    },
    updateSecurities (state, securities) {
      state.securities = securities
      ls.set(STORE_KEY_V2RAY_SECURITIES, JSON.stringify(securities))
    },
    updateNetworks (state, networks) {
      state.networks = networks
      ls.set(STORE_KEY_V2RAY_NETWORKS, JSON.stringify(networks))
    },
    updateTypes (state, types) {
      state.types = types
      ls.set(STORE_KEY_V2RAY_TYPES, JSON.stringify(types))
    },
    updateTlses (state, tlses) {
      state.tlses = tlses
      ls.set(STORE_KEY_V2RAY_TLSES, JSON.stringify(tlses))
    },
  },
  actions: {
    initConfig ({ commit }, { config, meta }) {
      commit('updateConfig', [config])
      commit('updateMeta', meta)
      if (meta.version) {
        document.title = `${document.title} v${meta.version}`
      }
      const initialSelected = config.configs[config.index]
      if (initialSelected) {
        commit('setCurrentConfig', initialSelected)
      }
      if (config.v2rayPath) {
        commit('updateView', { page: views[2] })
      }
    },
    updateConfig ({ getters, commit }, targetConfig) {
      let index
      if (targetConfig.configs && getters.selectedConfig) {
        index = targetConfig.configs.findIndex(
          config => config.id === getters.selectedConfig.id
        )
      }
      const correctConfig =
        index !== undefined && index > -1
          ? { ...targetConfig, index }
          : targetConfig
      commit('updateConfig', [correctConfig, true])
    },
    updateConfigs ({ dispatch }, _configs) {
      const configs = _configs.map(config => {
        const _clone = clone(config)
        Object.keys(_clone).forEach(key => {
          if (configKeys.indexOf(key) < 0) {
            // 删除无用的key
            delete _clone[key]
          }
        })
        return _clone
      })
      dispatch('updateConfig', { configs })
    },
    addConfigs ({ state, dispatch }, configs) {
      if (configs.length) {
        dispatch('updateConfig', {
          configs: [...state.appConfig.configs, ...configs],
        })
      }
    },
    // 更新所有订阅服务器
    updateSubscribes ({ state, dispatch }, updateSubscribes) {
      // 要更新的订阅服务器
      updateSubscribes = updateSubscribes || state.appConfig.serverSubscribes
      // 累计更新节点数
      let updatedCount = 0
      return Promise.all(
        updateSubscribes.map(subscribe => {
          return somePromise([
            request(subscribe.URL, true),
            fetch(subscribe.URL).then(res => res.text()),
          ]).then(res => {
            const [groupCount, groupConfigs] = isSubscribeContentValid(res)
            if (groupCount > 0) {
              for (const groupName in groupConfigs) {
                const configs = groupConfigs[groupName]
                const group = configs[0].group
                // 更新的组下面原来的配置
                const groupedConfigs = []
                // 不在更新组里面的配置
                const notInGroupConfigs = []
                state.appConfig.configs.forEach(config => {
                  if (config.group === group) {
                    groupedConfigs.push(config)
                  } else {
                    notInGroupConfigs.push(config)
                  }
                })
                // 原组中没有发生变更的节点
                const oldNotChangedConfigs = groupedConfigs.filter(config => {
                  const i = configs.findIndex(_config =>
                    isConfigEqual(config, _config)
                  )
                  if (i > -1) {
                    // 未发生实际更新的节点删除
                    configs.splice(i, 1)
                    return true
                  }
                  return false
                })
                if (configs.length) {
                  dispatch(
                    'updateConfigs',
                    oldNotChangedConfigs
                      .concat(configs)
                      .concat(notInGroupConfigs)
                  )
                  updatedCount += configs.length
                } else {
                  console.log('订阅节点并未发生变更')
                }
              }
            }
          })
        })
      ).then(() => {
        return updatedCount
      })
    },
  },
  getters: {
    selectedConfig: state => state.appConfig.configs[state.appConfig.index],
    isEditingConfigUpdated: state =>
      !isConfigEqual(state.editingConfigBak, state.editingConfig),
  },
})
