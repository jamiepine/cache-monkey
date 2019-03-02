<template>
  <div class="alerts_container">
    <div v-for="a in alerts" :key="a.id">
      <div :class="a.theme" class="alert" @click="(a.link ? open(a.link): null)" v-html="a.message"></div>
    </div>

    <!-- <div v-bind:class="{ 'show-alert': alert, 'text-danger': hasError }" class="alert">
            {{ message }}
    </div>-->
  </div>
</template>


<script>
export default {
  name: "Alerts",
  data() {
    return {
      alerts: []
    };
  },
  mounted() {
    this.$root.$on("alert", (type, message, link) => {
      this[type](message, link);
    });
  },
  methods: {
    createAlert: function(theme, message, link) {
      if (this.alerts.filter(alert => alert.message === message).length <= 0) {
        var alertObject = {
          id: Math.random(),
          message: message,
          theme: theme,
          link: link
        };
        this.alerts.push(alertObject);
        var vm = this;
        setTimeout(function(e) {
          vm.alerts.shift();
        }, (link ? 12000 : 4000));
      }
    },
    success: function(message, link) {
      this.createAlert("success fadeout", message, link);
    },
    error: function(message, link) {
      this.createAlert("error fadeout", message, link);
    },
    info: function(message, link) {
      this.createAlert("info fadeout", message, link);
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    }
  }
};
</script>

<style scoped lang="scss">
.alerts_container {
  position: absolute;
  bottom: 0px;
  right: 10px;
  width: 100%;
  z-index: 900991;
}

.alert {
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  animation: fade 4s;
  text-align: center;
  margin: 0 20px;
}

/* @keyframes fadein {
        from { opacity: 0; margin-top: -15px; }
        to   { opacity: 1; margin-top: 10px;}
    } */
@keyframes fade {
  0% {
    opacity: 0;
    margin-bottom: -15px;
  }
  5% {
    opacity: 1;
    margin-bottom: 10px;
  }
  95% {
    opacity: 1;
    margin-bottom: 10px;
  }
  100% {
    opacity: 0;
    margin-bottom: -15px;
  }
}

.success {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}

.error {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}

.info {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}

.dark .success {
  color: #7ae77a;
  background-color: #263b1f;
  border-color: #afc0a200;
}

.dark .error {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}

.dark .info {
  color: #45abdd;
  background-color: #1f3d4b;
  border-color: #4093a800;
}
</style>
