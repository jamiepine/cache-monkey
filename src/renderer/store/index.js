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
    watchBlocker: true
  },
  plugins: [
    createPersistedState(),
    // createSharedMutations(),
  ],
  strict: process.env.NODE_ENV !== 'production',
});
