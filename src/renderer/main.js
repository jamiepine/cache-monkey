import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';

// import '../logic/database/database';
// Font Awesome Libraries
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faMagic, faHeart } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faLinkedinIn, faTwitch } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add({
  faTwitter,
  faLinkedinIn,
  faTwitch,
  faEnvelope,
  faMagic,
  faHeart
});

Vue.component('icon', FontAwesomeIcon);

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