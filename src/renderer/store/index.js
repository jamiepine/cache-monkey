import Vue from 'vue';
import Vuex from 'vuex';

import { createPersistedState, createSharedMutations } from 'vuex-electron';

import modules from './modules';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: false,
  modules,
  state: {
    fileIndex: {},
    scan: [],
    drives: [],
    dumpDirectory: "",
    watchDirectories: [],
    foundFiletypes: [],
    // task tracking
    currentTask: "Checking for updates...",
    totalAnalysing: 0,
    totalAnalysed: 0,
    dumpScanComplete: false,
    dirScanComplete: false,
    watchBlocker: true,
    // tooltips 
    tooltipDefault: {
      placement: 'top',
      arrow: true,
      animation: 'fade',
      delay: [0, 0],
      duration: 0
    },
    tooltipBottom: {
      placement: 'bottom',
      arrow: true,
      animation: 'fade',
      delay: [0, 0],
      duration: 0
    },
    tooltipSidebar: {
      placement: 'right',
      arrow: true,
      animation: 'fade',
      delay: [0, 0],
      duration: 0
    }
  },
  plugins: [
    createPersistedState(),
    // createSharedMutations(),
  ],
  strict: process.env.NODE_ENV !== 'production',
});
