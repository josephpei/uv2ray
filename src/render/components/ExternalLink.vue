<template>
  <a href @click.prevent="open">
    <slog>{{ href }}</slog>
  </a>
</template>

<script>
import { shell } from 'electron'
export default {
  name: 'ExternalLink',
  props: {
    href: String,
  },
  methods: {
    open () {
      shell.openExternal(this.href)
    },
  },
}
</script>
