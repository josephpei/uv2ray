<template>
  <AppView name="setup" class="px-2 bg-primary">
    <div class="flex flex-column flex-ai-center w-100">
      <div class="flex flex-ai-center w-100">
        <div class="flex-1 flex flex-ai-center flex-jc-end">
          <Checkbox v-model="sysV2ray" @on-change="useSysV2ray">使用系统v2ray</Checkbox>
        </div>
        <span class="mx-2">OR</span>
        <div class="flex-1 flex flex-ai-center">
          <Form ref="form" class="flex-1" :model="form" :rules="rules" inline>
            <FormItem prop="v2rayPath" style="margin-bottom:0">
              <Button type="primary" class="w-6r" @click="selectPath">手动选择</Button>
              <Input v-model="form.v2rayPath" readonly placeholder="所选目录下需有v2ray文件" style="width:180px" />
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  </AppView>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { openDialog } from '../ipc'
import { isV2rayPathAvaliable } from '../../shared/utils'

export default {
  data () {
    return {
      sysV2ray: false,
      form: {
        v2rayPath: '',
      },
      rules: {
        v2rayPath: [
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
  methods: {
    ...mapMutations(['updateConfig']),
    useSysV2ray (v) {
      if (v) {
        this.setup('/usr/bin')
      }
    },
    // 选择目录
    selectPath () {
      const path = openDialog({
        properties: ['openDirectory'],
      })
      if (path && path.filePaths.length) {
        this.form.v2rayPath = path.filePaths[0]
        this.$refs.form.validate(valid => {
          if (valid) {
            this.setup()
          }
        })
      }
    },
    // 完成初始化
    setup (v2rayPath) {
      this.updateConfig([{ v2rayPath: v2rayPath || this.form.v2rayPath }, true])
      this.$emit('finished')
    },
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
