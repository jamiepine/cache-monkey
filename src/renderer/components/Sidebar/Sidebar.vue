<template>
  <div id="sidebar">
    <div id="apple-buttons-area"></div>
    <div class="logo"></div>
    <router-link to="home">
      <div class="sidebar-item">
        <icon class="icon" :icon="['fa', 'magic']"></icon>
      </div>
    </router-link>
    <router-link to="info">
      <div class="sidebar-item">
        <icon class="icon" :icon="['fa', 'heart']"></icon>
      </div>
    </router-link>
    <div class="sidebar-item">
      <icon class="icon" :icon="['fab', 'twitter']"></icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "home",
  components: {},
  mounted() {},
  data() {
    return {};
  },
  methods: {}
};
</script>

<style lang="scss">
#sidebar {
  min-width: 70px;
  height: 100vh;
  background: var(--sidebar);
  transition: 200ms;
  position: fixed;
}
#apple-buttons-area {
  height: 23px;
  -webkit-app-region: drag;
  /* background: #d8d8d8 */
}
.sidebar-item {
  background: var(--boxLight);
  margin: 10px;
  border-radius: 50%;
  min-width: 50px;
  height: 50px;
  display: block;
  padding: 14px;
  font-size: 23px;
  cursor: pointer;
  transition: 100ms;
  margin-bottom: 10px;
  &:hover {
    background: var(--avatar);
  }
}
.router-link-exact-active .sidebar-item {
  background: var(--avatarActive);
}
.icon {
}
</style>
