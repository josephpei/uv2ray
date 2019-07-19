<template>
  <Form class="panel-form" ref="form" :model="editingConfig" :rules="rules" :label-width="88">
    <FormItem label="服务器地址" prop="add">
      <Input type="text" :value="editingConfig.add" @input="v => onInput('add', v)"/>
    </FormItem>
    <FormItem label="服务器端口" prop="port">
      <InputNumber :value="parseInt(editingConfig.port)" @input="v => onInput('port', v)"/>
    </FormItem>
    <FormItem label="用户ID" prop="uid">
      <Input type="text" :value="editingConfig.uid" @input="v => onInput('uid', v)" />
    </FormItem>
    <FormItem label="额外ID" prop="aid">
      <Input type="text" :value="editingConfig.aid" @input="v => onInput('aid', v)" />
    </FormItem>
    <FormItem label="加密方式" prop="security">
      <Select :value="editingConfig.security" @input="v => onInput('security', v)" @on-change="onSecurityChange">
        <Option v-for="security in securities" :key="security" :value="security">{{ security }}</Option>
      </Select>
    </FormItem>
    <FormItem label="传输协议" prop="net">
      <Select :value="editingConfig.net" @input="v => onInput('net', v)" @on-change="onNetworkChange">
        <Option v-for="network in networks" :key="network" :value="network">{{ network }}</Option>
      </Select>
    </FormItem>
    <FormItem label="伪装类型" prop="type">
      <Select :value="editingConfig.type" @input="v => onInput('type', v)" @on-change="onTypeChange">
        <Option v-for="type in types" :key="type" :value="type">{{ type }}</Option>
      </Select>
    </FormItem>
    <FormItem label="伪装域名" prop="host">
      <Input type="text" placeholder="1 ws host; 2 http/h2 host 中间逗号隔开; 3 quic 加密方式" :value="editingConfig.host" @input="v => onInput('host', v)" />
    </FormItem>
    <FormItem label="路径" prop="path">
      <Input type="text" placeholder="1 ws/h2 path; 2 quic 加密密钥" :value="editingConfig.path" @input="v => onInput('path', v)" />
    </FormItem>
    <FormItem label="底层传输安全" prop="tls">
      <Select :value="editingConfig.tls" @input="v => onInput('tls', v)" @on-change="onTlsChange">
        <Option v-for="tls in tlses" :key="tls" :value="tls">{{ tls }}</Option>
      </Select>
    </FormItem>
    <FormItem label="备注" prop="ps">
      <Input :value="editingConfig.ps" @input="v => onInput('ps', v)"/>
    </FormItem>
    <FormItem label="分组">
      <AutoComplete
        :data="filteredGroups"
        clearable
        placeholder="未分组"
        placement="top"
        :value="editingConfig.group"
        @input="v => onInput('group', v)"
      />
    </FormItem>
  </Form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'V2rayForm',
  data () {
    return {
      rules: {
        add: { required: true },
        port: { required: true },
        uid: { required: true },
        aid: { required: true },
        security: { required: true },
        net: { required: true },
        type: { required: false },
        host: { required: false },
        path: { required: false },
        tls: { required: false },
        ps: { required: false }
      },
      groupText: '',
    }
  },
  computed: {
    ...mapState(['appConfig', 'editingConfig', 'securities', 'networks', 'types', 'tlses']),
    groups () {
      if (this.appConfig && this.appConfig.configs && this.appConfig.configs.length) {
        const groups = []
        this.appConfig.configs.forEach(config => {
          if (config.group) {
            if (groups.indexOf(config.group) < 0) {
              groups.push(config.group)
            }
          }
        })
        return groups
      } else {
        return []
      }
    },
    filteredGroups () {
      if (!this.editingConfig.group) {
        return this.groups
      }
      return this.groups.filter(item => item.indexOf(this.editingConfig.group) > -1)
    },
  },
  methods: {
    onInput (field, v) {
      this.$store.commit('updateEditing', { [field]: v })
    },
    onSecurityChange (v) {
      this.onInput('security', v)
    },
    onNetworkChange (v) {
      this.onInput('net', v)
    },
    onTypeChange (v) {
      this.onInput('type', v)
    },
    onTlsChange (v) {
      this.onInput('tls', v)
    },
  },
}
</script>

<style lang="stylus">
.panel-form
  .ivu-form-item
    margin-bottom 4px
  .ivu-input-number
    width 100%
  .ivu-select-dropdown
    max-height 140px
</style>
