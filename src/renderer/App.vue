<template>
  <div id="app">
    <Sidebar/>
    <router-view></router-view>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar/Sidebar";
import { mapGetters, mapState } from "vuex";
import drivelist from "drivelist";
import { promisify } from "util";
const { dialog } = require("electron").remote;
const Path = require("path");
const fs = require("fs");
const readChunk = require("read-chunk");
const fileType = require("file-type");
const os = require("os");
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const chokidar = require("chokidar");

export default {
  name: "cachemonkey",
  components: {
    Sidebar
  },
  async created() {
    this.initGlobalStyleVariables();
    // set default dump directory
    let userDir = Path.join(os.homedir())
      .split("\\")
      .join("/");

    let dumpDir = `${userDir}/CacheMonkeyDump`;
    let discordCacheDir = `${userDir}/AppData/Roaming/discord/Cache`;
    if (os.platform() === "darwin") {
      discordCacheDir = `${userDir}/Library/Application Support/discord/Cache`;
    }
    let ready = true;
    console.log(discordCacheDir);

    const dumpExists = await fs.statSync(dumpDir);

    if (dumpExists) {
      this.dumpDirectory = dumpDir;
    } else {
      // create dump folder
      fs.mkdir(dumpDir, err => {
        if (err) {
          this.currentTask = "Failed to create dump directory.";
          ready = false;
        }
        this.dumpDirectory = dumpDir;
      });
    }

    const discordCacheExists = await fs.statSync(discordCacheDir);

    if (discordCacheExists) {
      this.watchDirectories.push({
        name: "discord",
        dir: discordCacheDir
      });
    } else {
      this.currentTask = "Could not find Discord cache, please add manually.";
      ready = false;
    }

    if (ready) {
      this.$store.state.autoStart = true;
    }
  },
  methods: {
    // this method appends a <style> element with the current theme varibales at the end of the <body>
    initGlobalStyleVariables() {
      // convert theme object to CSS
      let keys = Object.keys(this.getTheme);
      let stylesAsString = `:root {`;
      for (let key of keys)
        stylesAsString = stylesAsString + `--${key}: ${this.getTheme[key]};`;
      const css = stylesAsString + "}";

      // remove current style tag from DOM by ID
      let element = document.getElementById("STYLE_VARS");
      if (element) element.parentNode.removeChild(element);

      // build element
      let style = document.createElement("style");
      style.type = "text/css";
      style.id = "STYLE_VARS";

      // insert styles as a string
      style.appendChild(document.createTextNode(css));

      // append to body
      document.body.appendChild(style);
    }
  },
  computed: {
    ...mapGetters(["getTheme", "getThemeName"]),
    ...mapState([
      "fileIndex",
      "dumpDirectory",
      "watchDirectories",
      "foundFiletypes",
      "currentTask",
      "totalAnalysing",
      "totalAnalysed",
      "dumpScanComplete",
      "dirScanComplete",
      "watchBlocker"
    ]),
    fileIndex: {
      get() {
        return this.$store.state.fileIndex;
      },
      set(value) {
        this.$store.state.fileIndex = value;
      }
    },
    dumpDirectory: {
      get() {
        return this.$store.state.dumpDirectory;
      },
      set(value) {
        this.$store.state.dumpDirectory = value;
      }
    },
    watchDirectories: {
      get() {
        return this.$store.state.watchDirectories;
      },
      set(value) {
        this.$store.state.watchDirectories = value;
      }
    },
    foundFiletypes: {
      get() {
        return this.$store.state.foundFiletypes;
      },
      set(value) {
        this.$store.state.foundFiletypes = value;
      }
    },
    currentTask: {
      get() {
        return this.$store.state.currentTask;
      },
      set(value) {
        this.$store.state.currentTask = value;
      }
    },
    totalAnalysing: {
      get() {
        return this.$store.state.totalAnalysing;
      },
      set(value) {
        this.$store.state.totalAnalysing = value;
      }
    },
    totalAnalysed: {
      get() {
        return this.$store.state.totalAnalysed;
      },
      set(value) {
        this.$store.state.totalAnalysed = value;
      }
    },
    dumpScanComplete: {
      get() {
        return this.$store.state.dumpScanComplete;
      },
      set(value) {
        this.$store.state.dumpScanComplete = value;
      }
    },
    dirScanComplete: {
      get() {
        return this.$store.state.dirScanComplete;
      },
      set(value) {
        this.$store.state.dirScanComplete = value;
      }
    },
    watchBlocker: {
      get() {
        return this.$store.state.watchBlocker;
      },
      set(value) {
        this.$store.state.watchBlocker = value;
      }
    }
  },
  watch: {
    // when theme changes in the store,
    getThemeName() {
      this.initGlobalStyleVariables();
    }
  }
};
</script>
<style lang="scss">
/* Big boy global styles */
body {
  margin: 0;
  line-height: 1;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background: var(--background);
  color: var(--text);
}
#app {
  display: flex;
  transition: 200ms;
  background-color: var(--background);
  color: var(--text);
}
.app {
  display: flex;
  flex-direction: row;
  height: calc(100vh - var(--pageContainerOffset));
}
.page {
  margin-left: 70px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.page-container {
  flex: 1 1 auto;
  margin-left: 0px;
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  height: calc(100vh - var(--pageContainerOffset));
  border-radius: 5px 0 0 0;
  background: var(--background);
  .__view {
    /* Important needed to override Vue-Scroll inline styles */
    width: 100% !important;
    display: flex !important;
  }
  .page-content {
    max-width: 1090px;
    min-width: 480px;
    margin: 0 auto;
    flex-grow: 1;
  }
  .__rail-is-horizontal {
    display: none;
  }
  .__rail-is-vertical {
    box-shadow: 0 -11px 0 4px var(--background);
  }
}
.close-click-area {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  right: 0;
  // any floating elements need to be above 1000, everything else stays below
  z-index: 1000;
}

/* Global Helper Styles */
.invert {
  filter: invert(100%);
}
.padding {
  padding: 10px;
}
.margin {
  margin: 10px;
}
.margin-2 {
  margin: 20px;
}
.margin-right {
  margin-right: 10px;
}
.border-radius {
  border-radius: 5px;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-column {
  display: flex;
  flex-direction: column;
}
.space-between {
  justify-content: space-between;
}
.highlight {
  color: var(--highlight);
}
p {
  font-size: 12px;
  opacity: 0.5;
  margin-bottom: 20px;
}
small {
  margin-top: 5px;
  margin-bottom: 10px;
}
a {
  color: var(--text);
  text-decoration: none;
}
h1 {
  font-weight: 900;
  margin-top: 0px;
}
h2 {
  font-weight: 900;
  margin-top: 0px;
}
h4 {
  margin-top: 20px;
}
hr {
  border: 1px solid var(--box);
  margin-top: 20px;
  margin-bottom: 20px;
  opacity: 0.4;
}
input {
  background: none;
  border: none;
  color: var(--text);
  font-size: 15px;
  width: 100%;
}
select {
  background: var(--box);
  padding: 10px;
  border-radius: 5px;
  border: none;
  color: var(--text);
  width: 100%;
}
.page-content {
  padding: 20px;
}
.margin-vertical {
  margin: 5px 0;
}
.margin-right {
  margin-right: 10px;
}
.invert {
  filter: invert(100%);
}
.no-interact {
  pointer-events: none;
}
.opacity-low {
  opacity: 0.5;
}
.no-hover:hover {
  cursor: normal;
  transform: unset !important;
}
.no-transition {
  transition: unset !important;
}
.center {
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  display: flex;
}
/* BUTTONS */
$highlight: #1bb9dc;
$danger: #d63046;
$warning: rgb(214, 161, 48);

.coolbtn {
  padding: 10px 15px;
  background: var(--box);
  color: var(--text);
  font-weight: 600;
  border: none;
  font-size: 13px;
  border-radius: 5px;
  cursor: pointer;
  transition: 200ms;
  outline: none;
  position: relative;
  text-align: center;
  .fa-spinner {
    display: none;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -8px;
    margin-top: -6px;
  }
  &.bigbtn {
    padding: 17px 30px;
    font-size: 15px;
    border-bottom: 3px solid #0000006e;
  }
  &.notifybtn {
    padding: 10px 17px;
    border-radius: 25px;
    min-width: 80px;
  }
  &.loading {
    span {
      opacity: 0.1;
    }
    .fa-spinner {
      display: block;
    }
  }
  &.borderless {
    background: none;
  }
  &:hover,
  &.active:hover {
    background: var(--boxHover);
  }
  &.no-hover:hover {
    background: unset !important;
  }
  &:active {
    opacity: 0.8;
  }
  &.highlight {
    background-color: $highlight;
    color: lighten($highlight, 50%);
    &:hover {
      background-color: darken($highlight, 10%);
    }
  }
  &.danger {
    background-color: $danger;
    color: lighten($danger, 50%);
    &:hover {
      background-color: darken($danger, 10%);
    }
  }
  &.warning {
    background-color: $warning;
    color: lighten($warning, 50%);
    &:hover {
      background-color: darken($warning, 10%);
    }
  }
}

/* CARDS */
.card {
  border-radius: 5px;
  background-color: var(--box);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  font-size: 14px;
  padding-bottom: 5px;
  .card-header {
    height: 30px;
    width: 100%;
    font-weight: 500;
    font-size: 12px;
    display: flex;
    border-bottom: 1px solid var(--background);
    background-color: var(--searchBackground);
    border-radius: 5px 5px 0 0;
    color: var(--faintText); /* background: var(--background); */
    span {
      padding: 10px;
      flex-grow: 1;
    }
    .right {
      justify-content: center;
      align-items: center;
      display: flex;
      width: 30px;
      height: 30px;
      /* background-color: #111111; */
      cursor: pointer;
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
  }
  &.background {
    background-color: var(--searchBackground);
  }
}

/* VUE-TIPPY */
.tippy-tooltip {
  background-color: #111111;
  font-size: 13px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.281);
}
.tippy-popper[x-placement^="bottom"] .tippy-tooltip .tippy-arrow,
.tippy-popper[x-placement^="top"] .tippy-tooltip .tippy-arrow,
.tippy-popper[x-placement^="left"] .tippy-tooltip .tippy-arrow,
.tippy-popper[x-placement^="right"] .tippy-tooltip .tippy-arrow {
  fill: #111111;
}

.tippy-popper[x-placement^="right"] .tippy-tooltip .tippy-arrow {
  border-right: 7px solid #111111;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
}

/* annoying electron highlight */
:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
  /* user-select: none; */
}
input,
button,
textarea,
:focus {
  outline: none; // You should add some other style for :focus to help UX/a11y
}
</style>
