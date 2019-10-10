<template>
  <AppView name="feature">
    <h1>Electron V2ray 客户端</h1>
    <Row type="flex" :gutter="24" class="mt-64">
      <i-col class="col flex flex-column flex-ai-center flex-jc-center">
        <icon-cross />
        <b class="font-18 my-1">跨平台</b>
        <p>支持Windows、MacOs、Linux系统</p>
      </i-col>
      <i-col class="col flex flex-column flex-ai-center flex-jc-center">
        <icon-functions />
        <b class="font-18 my-1">功能齐全</b>
        <p>支持多种实用功能</p>
      </i-col>
      <i-col class="col flex flex-column flex-ai-center flex-jc-center">
        <icon-open />
        <b class="font-18 my-1">开源</b>
        <p>v2ray和uv2ray源代码均开放</p>
      </i-col>
    </Row>
    <!-- <div class="flex flex-ai-center mt-64">
      <Checkbox v-model="autoDownload" @on-change="updateAutoDownload">自动下载v2ray</Checkbox>
      <Tooltip placement="top" content="勾选上后将自动下载v2ray" style="margin-top:2px">
        <Icon color="#495060" type="help-circled"></Icon>
      </Tooltip>
    </div> -->
    <Button type="primary" class="w-6r mt-1" @click="done">知道了</Button>
  </AppView>
</template>
<script>
import { ls } from '../store'
import IconCross from '../assets/icon_cross_platform.svg'
import IconFunctions from '../assets/icon_functions.svg'
import IconOpen from '../assets/icon_open_source.svg'
import { STORE_KEY_FEATURE } from '../constants'
export default {
  data () {
    return {
      autoDownload: false,
    }
  },
  components: {
    IconCross,
    IconFunctions,
    IconOpen,
  },
  methods: {
    done () {
      ls.set(STORE_KEY_FEATURE, 'read')
      this.$emit('finished')
    },
  },
}
</script>
<style lang="stylus">
@import '../assets/styles/variable.styl'

.view-feature
  .mt-64
    margin-top 64px
  .col
    width 240px
  svg
    width 40px
    height 40px
    > path
      fill $color-primary
</style>
