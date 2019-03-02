<template>
  <div class="alerts_container">
    <div v-for="a in alerts" :key="a.id">
      <div :class="a.theme" class="alert">{{ a.message }}</div>
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
    this.$root.$on("alert", (type, message) => {
      this[type](message);
    });
  },
  methods: {
    createAlert: function(theme, message) {
      if (this.alerts.filter(alert => alert.message === message).length > 0) {
        var alertObject = {
          id: Math.random(),
          message: message,
          theme: theme
        };
        this.alerts.push(alertObject);
        var vm = this;
        setTimeout(function(e) {
          vm.alerts.shift();
        }, 4000);
      }
    },
    success: function(message) {
      this.createAlert("success fadeout", message);
    },
    error: function(message) {
      this.createAlert("error fadeout", message);
    },
    info: function(message) {
      this.createAlert("info fadeout", message);
    }
  }
};
</script>

<style scoped>
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
