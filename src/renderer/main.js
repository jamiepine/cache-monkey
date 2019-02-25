import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';

// import '../logic/database/database';



// import dao from '../logic/database/dao'

// const CoreDB = new dao('Core', true);
// CoreDB.connect().then(() => {
//   CoreDB.newRow('user', {
//     name: 'Jamie',
//     email: 'jamie@notify.me'
//   }).then()
// })


if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>',
}).$mount('#app');