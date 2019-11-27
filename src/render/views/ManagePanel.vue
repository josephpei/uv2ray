<template>
  <AppView name="panel" class="bg-primary px-2 py-2" row>
    <V2rayNodes></V2rayNodes>
    <V2rayFrom class="flex-1 mx-1"></V2rayFrom>
    <V2rayGroup v-show="editingGroup.show && editingGroup.title" class="flex-1 ml-1"></V2rayGroup>
    <V2rayQrcode v-show="!editingGroup.show"></V2rayQrcode>
    <div v-show="editingGroup.show && !editingGroup.title" class="flex-1"></div>
  </AppView>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import V2rayNodes from './panel/V2rayNodes'
import V2rayFrom from './panel/V2rayForm'
import V2rayGroup from './panel/V2rayGroup'
import V2rayQrcode from './panel/V2rayQrcode'
import { ipcRenderer } from 'electron'
import { EVENT_V2RAY_VERSION_RENDERER, EVENT_V2RAY_VERSION_MAIN } from '../../shared/events'

export default {
  name: 'ManagePanel',
  components: { V2rayNodes, V2rayFrom, V2rayGroup, V2rayQrcode },
  computed: {
    ...mapState(['appConfig', 'editingGroup']),
  },
  methods: {
    ...mapActions(['updateConfig']),
  },
  created () {
    const self = this
    function callback (e, v2rayVersion) {
      self.updateConfig({ v2rayVersion: v2rayVersion})
    }
    ipcRenderer.send(EVENT_V2RAY_VERSION_RENDERER, self.appConfig.v2rayPath)
    ipcRenderer.on(EVENT_V2RAY_VERSION_MAIN, callback)
  }
}
</script>

<style lang="stylus">
@import '../assets/base.styl'
</style>
