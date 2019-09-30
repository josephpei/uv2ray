<template>
  <div class="options-container px-2 pb-2 scroll-y">
    <Form ref="form" class="mt-1" :model="form" :label-width="120">
      <FormItem class="flex-1" label="日志等级">
        <Select v-model="form.logLevel" @on-change="update('logLevel')">
          <Option v-for="level in loglevels" :key="level" :value="level">{{ level }}</Option>
        </Select>
      </FormItem>
      <FormItem class="flex-1" label="域名策略">
        <Select v-model="form.domainStrategy" @on-change="update('domainStrategy')">
          <Option v-for="strategy in nstrategies" :key="strategy" :value="strategy">{{ strategy }}</Option>
        </Select>
      </FormItem>
      <FormItem class="flex-1" label="域名策略">
        <Select v-model="form.routerModel" @on-change="update('routerModel')">
          <Option v-for="model in rmodels" :key="model" :value="model">{{ model }}</Option>
        </Select>
      </FormItem>
      <FormItem class="flex-1" label="自定义DNS">
        <Input type="text" placeholder="1.1.1.1,8.8.8.8" v-model="form.customDNS" @on-change="update('customDNS')" />
      </FormItem>
    </Form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { debounce } from '../../../shared/utils'
export default {
  data () {
    const appConfig = this.$store.state.appConfig
    return {
      form: {
        logLevel: appConfig.logLevel,
        domainStrategy: appConfig.domainStrategy,
        routerModel: appConfig.routerModel,
        customDNS: appConfig.customDNS.toString()
      }
    }
    // 增加 rules，校验 DNS 格式
  },
  computed: {
    ...mapState(['loglevels', 'nstrategies', 'rmodels']),
  },
  watch: {
    'appConfig.logLevel' (v) {
      this.logLevel = v
    },
    'appConfig.domainStrategy' (v) {
      this.domainStrategy = v
    },
    'appConfig.routerModel' (v) {
      this.routerModel = v
    },
    'appConfig.customDNS' (v) {
      this.customDNS = v.split(',')
    }
  },
  methods: {
    ...mapActions(['updateConfig']),
    update: debounce(function (field) {
      if (this.form[field] !== this.$store.state.appConfig[field]) {
        this.updateConfig({ [field]: this.form[field] })
      }
    }, 1000)
  },
}
</script>
