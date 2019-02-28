<template>
  <div v-if="viewing" class="file-view">
    <div class="image-view">
      <img :src="`${dumpDirectory}/${viewing.dumpKey}`">
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    viewing() {
      return this.$store.state.viewingItem;
    },
    dumpDirectory() {
      return this.$store.state.dumpDirectory;
    }
  }
};
</script>

<style lang="scss">
.file-view {
  display: flex;
}
</style>
