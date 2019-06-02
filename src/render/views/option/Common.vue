<template>
  <div class="options-container px-2 pb-2 scroll-y">
    <Form ref="form" class="mt-1" :model="form" :rules="rules" :label-width="120">
      <FormItem prop="v2rayPath" label="v2ray目录">
        <Input
          v-model="form.v2rayPath"
          placeholder="请选择 v2ray 目录"
          @on-change="changeV2rayPath"
          style="width:200px"
        />
        <Button type="primary" @click="selectPath">选择 v2ray 目录</Button>
      </FormItem>
      <div class="flex">
        <FormItem class="flex-1" label="开机自启动">
          <Checkbox v-model="form.autoLaunch" @on-change="update('autoLaunch')"/>
        </FormItem>
        <FormItem class="flex-1" label="局域网共享">
          <Checkbox v-model="form.shareOverLan" @on-change="update('shareOverLan')"/>
        </FormItem>
        <FormItem class="flex-1" label="http代理">
          <Checkbox v-model="form.httpProxyEnable" @on-change="update('httpProxyEnable')"/>
        </FormItem>
      </div>
      <div class="flex">
        <FormItem class="flex-1" label="pac端口">
          <InputNumber v-model="form.pacPort" :min="0" :max="65535" @on-change="update('pacPort')"/>
        </FormItem>
        <FormItem class="flex-1" label="本地监听端口">
          <InputNumber v-model="form.localPort" :min="0" :max="65535" @on-change="update('localPort')" />
        </FormItem>
        <FormItem class="flex-1" label="http代理端口">
          <InputNumber v-model="form.httpProxyPort" :min="0" :max="65535" @on-change="update('httpProxyPort')" />
        </FormItem>
      </div>
    </Form>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import { isV2rayPathAvaliable, debounce } from '../../../shared/utils'
import { openDialog } from '../../ipc'
export default {
  data () {
    const appConfig = this.$store.state.appConfig
    return {
      form: {
        v2rayPath: appConfig.v2rayPath,
        autoLaunch: appConfig.autoLaunch,
        shareOverLan: appConfig.shareOverLan,
        localPort: appConfig.localPort,
        pacPort: appConfig.pacPort,
        httpProxyEnable: appConfig.httpProxyEnable,
        httpProxyPort: appConfig.httpProxyPort,
      },
      rules: {
        v2rayPath: [
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
  watch: {
    'appConfig.v2rayPath' (v) {
      this.v2rayPath = v
    },
    'appConfig.autoLaunch' (v) {
      this.autoLaunch = v
    },
    'appConfig.shareOverLan' (v) {
      this.shareOverLan = v
    },
    'appConfig.localPort' (v) {
      this.localPort = v
    },
    'appConfig.pacPort' (v) {
      this.pacPort = v
    },
  },
  methods: {
    ...mapActions(['updateConfig']),
    changeV2rayPath () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.updateConfig({ v2rayPath: this.form.v2rayPath })
        }
      })
    },
    // 选择目录
    selectPath () {
      const path = openDialog({
        properties: ['openDirectory'],
      })
      if (path && path.length) {
        this.form.v2rayPath = path[0]
        this.$refs.form.validate(valid => {
          if (valid) {
            this.updateConfig({ v2rayPath: this.form.v2rayPath })
          }
        })
      }
    },
    update: debounce(function (field) {
      if (this.form[field] !== this.$store.state.appConfig[field]) {
        this.updateConfig({ [field]: this.form[field] })
      }
    }, 1000),
  },
}
</script>
