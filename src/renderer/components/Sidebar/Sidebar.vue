<template>
  <div id="sidebar">
   <div id="apple-buttons-area"></div>
  </div>
</template>

<script>


export default {
  name: "landing-page",
  components: {  },
  mounted() {
   
  },
  data() {
    return {
    };
  },
  methods: {

  }
};
</script>

<style lang="scss">
    #sidebar {
        min-width: 70px;
        height: 100vh;
        background: var(--sidebar);
        transition: 200ms;
    }
    #apple-buttons-area {
        height: 23px;
        -webkit-app-region: drag;
        /* background: #d8d8d8 */
    }
</style>
