import Vue from "vue";
import Vuex from "vuex";

import { createPersistedState, createSharedMutations } from "vuex-electron";

import modules from "./modules";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: false,
  modules,
  state: {
    processing: false,
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
    autoStart: false,
    // tooltips
    tooltipDefault: {
      placement: "top",
      arrow: true,
      animation: "fade",
      delay: [0, 0],
      duration: 0
    },
    tooltipBottom: {
      placement: "bottom",
      arrow: true,
      animation: "fade",
      delay: [0, 0],
      duration: 0
    },
    tooltipSidebar: {
      placement: "right",
      arrow: true,
      animation: "fade",
      delay: [0, 0],
      duration: 0
    }
  },
  plugins: [
    createPersistedState()
    // createSharedMutations(),
  ]
});
