import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: require('@/components/LandingPage').default,
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/Settings').default,
    },
    {
      path: '/info',
      name: 'info',
      component: require('@/components/Info').default,
    },
    {
      path: '*',
      redirect: '/home',
    },
  ],
});
