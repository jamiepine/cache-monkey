<template>
  <div class="panel" :class="{'show': showPanel}" v-if="showPanel">wegwerg</div>
</template>

<script>
export default {
  props: ["item"],
  data() {
    return {};
  },
  computed: {
    showPanel: {
      get() {
        this.$store.state.showPanel;
      },
      set(value) {
        this.$store.state.showPanel = value;
      }
    }
  }
};
</script>

<style lang="scss">
.panel {
  position: absolute;
  right: -300px;
  top: 0px;
  width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  &.show {
    right: 0px;
  }
}
</style>
