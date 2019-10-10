import path from 'path'
import util from 'util'
import { execFile } from 'child_process'
// import treeKill from 'tree-kill'
import { dialog } from 'electron'
import { appConfigDir } from './bootstrap'
import { appConfig$ } from './data'
import { isHostPortValid } from './port'
import logger from './logger'
import { isConfigEqual, v2rayConfigHandler, isPathWritable } from '../shared/utils'
import { showNotification } from './notification'
let child

/**
 * 运行shell命令并写入到日志中
 * @param {*String} command 待执行的shell命令
 */
export function runCommand (command, params) {
  // child = execFile(command)
  // child.stdout.on('data', logger.info)
  // child.stderr.on('data', logger.error)
  if (command && params.length) {
    const commandStr = `${command} ${params.join(' ')}`
    logger.info('run command: %s', commandStr.replace(/-k [\d\w]* /, '-k ****** '))
    child = execFile(command, params)
    child.stdout.on('data', logger.info)
    child.stderr.on('data', logger.error)
  }
}

/**
 * 获取v2ray版本号
 */
export async function getV2rayVersion (appConfig) {
  const command = isPathWritable(appConfig.v2rayPath) ? 'v2ray' : path.join(appConfig.v2rayPath, 'v2ray')
  const execFile = util.promisify(require('child_process').execFile)
  const { stdout } = await execFile(command, ['-version'])
  const reg = /\d+\.\d+\.\d+/g
  const match = reg.exec(stdout)
  if (match) {
    return match[0]
  }
  return ''
}

/**
 * 运行v2ray
 * @param {*Object} config v2ray配置
 * @param {*String} v2rayPath v2ray的路径
 * @param {*[Number|String]} localPort 本地共享端口
 */
export async function run (appConfig) {
  const listenHost = appConfig.shareOverLan ? '0.0.0.0' : '127.0.0.1'
  // 先结束之前的
  await stop()
  try {
    await isHostPortValid(listenHost, appConfig.localPort || 1080)
  } catch (e) {
    logger.error(e)
    dialog.showMessageBox({
      type: 'warning',
      title: '警告',
      message: `端口 ${appConfig.localPort} 被占用`,
    })
  }
  const config = appConfig.configs[appConfig.index]
  // 生成 config.json
  const writable = isPathWritable(appConfig.v2rayPath)
  const configFile =
    writable
      ? path.join(appConfig.v2rayPath, 'config.json')
      : path.join(appConfigDir, 'config.json')
  v2rayConfigHandler(appConfig, config, configFile)
  const command = writable ? path.join(appConfig.v2rayPath, 'v2ray') : 'v2ray'
  const params = [`-config=${configFile}`]
  runCommand(command, params)
}

/**
 * 结束command的后台运行
 */
export function stop (force = false) {
  if (child && child.pid) {
    logger.log('Kill client')
    return new Promise((resolve, reject) => {
      child.once('close', () => {
        child = null
        if (timeout) {
          clearTimeout(timeout)
        }
        resolve()
      })
      const timeout = setTimeout(() => {
        // 5m内如果还没有关掉仍然resolve
        logger.error(`进程 ${child.pid} 可能无法关闭`)
        !force && showNotification(`进程 ${child.pid} 可能无法关闭，尝试手动关闭`)
        resolve()
      }, 5000)
      process.kill(child.pid, 'SIGKILL')
      // child.kill()
      // treeKill(child.pid, 'SIGKILL', err => {
      //   if (err) {
      //     reject(err)
      //   } else {
      //     // TODO: 待优化，目前是通过延迟一定时间来保证端口确实不被占用
      //     setTimeout(() => {
      //       child = null
      //       resolve()
      //     }, 100)
      //   }
      // })
    })
  }
  return Promise.resolve()
}

/**
 * 根据配置运行 v2ray 命令
 * @param {Object} appConfig 应用配置
 */
export function runWithConfig (appConfig) {
  if (appConfig.v2rayPath && appConfig.enable && appConfig.configs && appConfig.configs[appConfig.index]) {
    run(appConfig)
  }
}

// 监听配置变化
appConfig$.subscribe(data => {
  const [appConfig, changed, oldConfig] = data
  // 初始化
  if (changed.length === 0) {
    runWithConfig(appConfig)
  } else {
    if (changed.indexOf('enable') > -1) {
      if (appConfig.enable) {
        runWithConfig(appConfig)
      } else {
        stop()
      }
    } else if (appConfig.enable) {
      if (['v2rayPath', 'index', 'localPort', 'shareOverLan'].some(key => changed.indexOf(key) > -1)) {
        runWithConfig(appConfig)
      }
      if (changed.indexOf('configs') > -1) {
        // configs被清空
        if (!appConfig.configs.length) {
          stop()
        } else if (!oldConfig.configs.length) {
          // configs由空到有
          runWithConfig(appConfig)
        } else if (!isConfigEqual(appConfig.configs[appConfig.index], oldConfig.configs[oldConfig.index])) {
          // 只有选中的配置发生改变时才重新运行
          runWithConfig(appConfig)
        }
      }
    }
  }
})
