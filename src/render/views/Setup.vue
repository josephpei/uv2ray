<template>
  <AppView name="setup" class="px-2">
    <template v-if="(autoDownload || manualDownload) && !autoError">
      <Spin />
      <p class="text-center mt-1">
        正在为您下载
        <dot></dot>
      </p>
    </template>
    <div v-else class="flex flex-column flex-ai-center w-100">
      <div class="flex flex-ai-center w-100">
        <div class="flex-1 flex flex-ai-center flex-jc-end">
          <Button type="primary" class="w-6r" @click="restart">
            {{ autoError ? '点击重试' : '自动下载' }}
          </Button>
        </div>
        <span class="mx-2">OR</span>
        <div class="flex-1 flex flex-ai-center">
          <Form ref="form" class="flex-1" :model="form" :rules="rules" inline>
            <FormItem prop="ssrPath" style="margin-bottom:0">
              <Button type="primary" class="w-6r" @click="selectPath">手动选择</Button>
              <Input v-model="form.ssrPath" readonly placeholder="所选目录下需有ssr-local文件" style="width:180px" />
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  </AppView>
</template>
<script>
import { ipcRenderer } from 'electron'
import { join } from 'path'
import { mapState, mapMutations } from 'vuex'
import { ls } from '../store'
import { openDialog } from '../ipc'
import { isV2rayPathAvaliable } from '../../shared/utils'
import { STORE_KEY_AUTO_DOWNLOAD } from '../constants'
import { EVENT_V2RAY_DOWNLOAD_RENDERER, EVENT_V2RAY_DOWNLOAD_MAIN } from '../../shared/events'
import Dot from '../components/Dot'

export default {
  data () {
    return {
      autoDownload: ls.get(STORE_KEY_AUTO_DOWNLOAD) === '1',
      // 手动下载
      manualDownload: false,
      // 自动模式下载出错
      autoError: '',
      form: {
        ssrPath: '',
      },
      rules: {
        ssrPath: [
          { required: true, message: '请选择 v2ray 目录' },
          {
            validator: (rule, value, callback) => {
              if (isV2rayPathAvaliable(value)) {
                callback()
              } else {
                callback('该目录不正确，请重新选择')
              }
            },
          },
        ],
      },
    }
  },
  computed: {
    ...mapState(['meta']),
  },
  components: {
    Dot,
  },
  watch: {
    autoError (v) {
      if (v) {
        this.$Message.error({
          content: v,
          duration: 0,
        })
      } else {
        this.$Message.destroy()
      }
    },
  },
  methods: {
    ...mapMutations(['updateConfig']),
    restart () {
      this.autoError = ''
      // this.autoStart()
    },
    // 自动模式
    autoStart () {
      this.manualDownload = true
      this.autoError = ''
      const self = this

      function callback (e, errMessage) {
        console.log('download ssr result', e, errMessage)
        ipcRenderer.removeListener(EVENT_V2RAY_DOWNLOAD_MAIN, callback)
        if (errMessage) {
          self.autoError = errMessage
        } else {
          self.$nextTick(() => {
            // 需要在下载目录后追加shadowsocks子目录
            self.setup(join(self.meta.defaultSSRDownloadDir, 'shadowsocks'))
          })
        }
      }

      ipcRenderer.send(EVENT_V2RAY_DOWNLOAD_RENDERER)
      ipcRenderer.on(EVENT_V2RAY_DOWNLOAD_MAIN, callback)
    },
    // 选择目录
    selectPath () {
      this.manualDownload = false
      const path = openDialog({
        properties: ['openDirectory'],
      })
      if (path && path.length) {
        this.form.ssrPath = path[0]
        this.$refs.form.validate(valid => {
          if (valid) {
            this.setup()
          }
        })
      }
    },
    // 完成初始化
    setup (ssrPath) {
      this.$Message.destroy()
      this.updateConfig([{ ssrPath: ssrPath || this.form.ssrPath }, true])
      this.$emit('finished')
    },
  },
  created () {
    if (this.autoDownload) {
      // this.autoStart()
    }
  },
}
</script>
<style lang="stylus">
@import '../assets/styles/variable'

.view-setup
  .ivu-spin-dot
    width 48px
    height @width
</style>
