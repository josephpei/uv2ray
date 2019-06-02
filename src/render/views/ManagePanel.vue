<template>
  <AppView name="panel" class="px-2 py-2" row>
    <V2rayNodes></V2rayNodes>
    <V2rayFrom class="flex-1 mx-1"></V2rayFrom>
    <V2rayGroup v-show="editingGroup.show && editingGroup.title" class="flex-1 ml-1"></V2rayGroup>
    <V2rayQrcode v-show="!editingGroup.show"></V2rayQrcode>
    <div v-show="editingGroup.show && !editingGroup.title" class="flex-1"></div>
  </AppView>
</template>

<script>
import { mapState } from 'vuex'
import V2rayNodes from './panel/V2rayNodes'
import V2rayFrom from './panel/V2rayForm'
import V2rayGroup from './panel/V2rayGroup'
import V2rayQrcode from './panel/V2rayQrcode'

export default {
  name: 'ManagePanel',
  components: { V2rayNodes, V2rayFrom, V2rayGroup, V2rayQrcode },
  computed: {
    ...mapState(['editingGroup']),
  },
}
</script>

<style lang="stylus">
@import '../assets/base.styl'
</style>
