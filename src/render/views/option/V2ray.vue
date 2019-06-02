<template>
  <div class="options-container px-2 pb-2 scroll-y">
    <Alert v-if="showTip" type="info" closable @on-close="closeTip">双击可修改，修改后回车可保存，esc可取消修改。</Alert>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { STORE_KEY_V2RAY_TIP } from '../../constants'
// const ls = window.localStorage
import { ls } from '../../store'
export default {
  data () {
    return {
      showTip: !ls.get(STORE_KEY_V2RAY_TIP),
    }
  },
  computed: {
    ...mapState(['methods', 'protocols', 'obfses']),
  },
  components: { },
  methods: {
    ...mapMutations(['updateView', 'updateMethods', 'updateProtocols', 'updateObfses',]),
    closeTip () {
      ls.set(STORE_KEY_V2RAY_TIP, true)
    },
  },
}
</script>
