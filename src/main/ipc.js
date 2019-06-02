import { app, ipcMain, dialog } from 'electron'
import { readJsonSync } from 'fs-extra'
import * as events from '../shared/events'
import { appConfigPath, defaultV2rayDownloadDir } from './bootstrap'
import { updateAppConfig } from './data'
import { hideWindow, sendData } from './window'
import { importConfigFromClipboard } from './tray-handler'
import defaultConfig, { mergeConfig } from '../shared/config'
import { showNotification } from './notification'
import { toggleMenu } from './menu'
import logger from './logger'

/**
 * ipc-main事件
 */
ipcMain
  .on(events.EVENT_APP_HIDE_WINDOW, () => {
    // 隐藏窗口
    hideWindow()
  })
  .on(events.EVENT_APP_WEB_INIT, e => {
    // 页面初始化
    let stored
    try {
      stored = readJsonSync(appConfigPath)
      mergeConfig(stored)
    } catch (e) {
      stored = defaultConfig
    }
    e.returnValue = {
      config: stored,
      meta: {
        version: app.getVersion(),
        defaultV2rayDownloadDir,
      },
    }
  })
  .on(events.EVENT_RX_SYNC_RENDERER, (_, data) => {
    // 同步数据
    logger.debug(`received sync data: ${data}`)
    updateAppConfig(data, true)
  })
  // .on(events.EVENT_V2RAY_DOWNLOAD_RENDERER, e => {
  //   // 下载v2ray
  //   logger.info('start download v2ray')
  //   // 自动下载v2ray项目
  //   e.sender.send(events.EVENT_V2RAY_DOWNLOAD_MAIN, 'failed to download v2ray')
  //   })
  // })
  .on(events.EVENT_CONFIG_COPY_CLIPBOARD, () => {
    logger.info('import config from clipboard')
    // 从剪切板导入
    importConfigFromClipboard()
  })
  .on(events.EVENT_APP_NOTIFY_RENDERER, (_, body, title) => {
    // 显示来自renderer进程的通知
    showNotification(body, title)
  })
  .on(events.EVENT_APP_TOGGLE_MENU, () => {
    // 切换menu显示
    toggleMenu()
  })
  .on(events.EVENT_APP_OPEN_DIALOG, (e, params) => {
    const ret = dialog.showOpenDialog(params)
    e.returnValue = ret || ''
  })

/**
 * 将main进程的错误在renderer进程显示出来
 * @param {String|Object} err 错误内容
 */
export function showMainError (err) {
  sendData(events.EVENT_APP_ERROR_MAIN, err)
}
