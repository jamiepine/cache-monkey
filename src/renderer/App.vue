<template>
  <div>
    <Alerts/>
    <Sidebar/>
    <div class="topbar">
      <TrafficLights v-if="isMac()"/>
      <WindowsButtons v-else/>
    </div>
    <div id="app">
      <Panel/>
      <Modal/>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Panel from "./components/SlidePanel";
import TrafficLights from "./components/TrafficLights";
import WindowsButtons from "./components/WindowsButtons";
import Alerts from "./components/Alerts";
import Sidebar from "./components/Sidebar/Sidebar";
import { mapGetters, mapState } from "vuex";
import drivelist from "drivelist";
import Modal from "./components/Modal";
import { promisify } from "util";
const remote = require("electron").remote;
const dialoge = remote.dialog;
const win = remote.getCurrentWindow();
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
const uuid = require("uuid");

export default {
  name: "cachemonkey",
  components: {
    Sidebar,
    Panel,
    Modal,
    TrafficLights,
    WindowsButtons,
    Alerts
  },
  data() {
    return {
      watcherRunning: false
    };
  },
  async created() {
    this.initGlobalStyleVariables();
    // set default dump directory

    try {
      // API Call
      let request = new XMLHttpRequest();
      let uid = uuid.v4().replace(/-/g, "");
      request.open(
        "GET",
        `https://jamiepine.com/cachemonkeystats?uuid=${uid}&version=${remote.app.getVersion()}`
      );
      request.send();
    } catch (error) {}

    let userDir = Path.join(os.homedir())
      .split("\\")
      .join("/");

    let dumpDir =
      localStorage.getItem("dumpDir") || `${userDir}/CacheMonkeyDump`;

    this.picsDir = localStorage.getItem("picsDir") || `${userDir}/Pictures`;

    let ready = true;
    // console.log(discordCacheDir);

    const dumpExists = await fs.existsSync(dumpDir);

    // console.log(dumpExists, "wrgwrgwrg");

    if (dumpExists) {
      this.dumpDirectory = dumpDir;
    } else {
      //  delete persisted fileIndex as we don't have a dump folder
      localStorage.removeItem("fileIndex");
      // create dump folder
      fs.mkdir(dumpDir, err => {
        if (err) {
          this.currentTask = "Failed to create dump directory.";
          ready = false;
        }
        this.dumpDirectory = dumpDir;
      });
    }

    let discordCacheDir = `${userDir}/AppData/Roaming/discord/Cache`;
    if (os.platform() === "darwin") {
      discordCacheDir = `${userDir}/Library/Application Support/discord/Cache`;
    }
    const discordCacheExists = await fs.existsSync(discordCacheDir);

    if (localStorage.getItem("watchDirectories")) {
      this.watchDirectories = JSON.parse(
        localStorage.getItem("watchDirectories")
      );
    } else if (discordCacheExists) {
      this.watchDirectories.push({
        name: "discord",
        dir: discordCacheDir
      });
      localStorage.setItem(
        "watchDirectories",
        JSON.stringify(this.watchDirectories)
      );
    } else {
      this.currentTask = "Could not find Discord cache, please add manually.";
      ready = false;
    }

    if (ready) {
      if (localStorage.getItem("fileIndex")) {
        this.fileIndex = JSON.parse(localStorage.getItem("fileIndex"));
        this.dumpScanComplete = true;
        this.evaluateFileIndex();
        this.initWatchers();
      } else {
        this.scanDump();
      }
    }
  },
  watch: {
    // watchDirectories() {
    //   let check = []
    //   for (let directory of this.watchDirectories) {
    //     if (check.includes(this.watchDirectories[directory].dir)) {
    //       this.watchDirectories.splice(directory)
    //     } else {
    //       check.push(this.watchDirectories[directory].dir)
    //     }
    //   }
    // },
    dumpDirectory() {
      // if changed, mark scan as incomplete
      this.dumpScanComplete = false;
    },
    dumpScanComplete() {
      // this.scanAll();
    },
    dirScanComplete() {
      this.initWatchers();
    },
    currentTask() {
      if (this.watcherRunning) {
        setTimeout(() => (this.currentTask = "Waiting for changes..."), 12000);
      }
    }
  },
  methods: {
    initWatchers() {
      if (this.watcherRunning) return;
      setTimeout(() => (this.watchBlocker = false), 15000);
      if (process.env.NODE_ENV !== "development")
        for (let dir of this.watchDirectories) {
          const watcher = chokidar.watch(dir.dir, { persistent: true });
          this.watcherRunning = true;
          watcher.on("add", async path => {
            if (
              !this.watchBlocker &&
              !this.processing &&
              this.dumpScanComplete
            ) {
              console.log("File", path, "has been added");
              let arr = path.split("/");
              await this.processItem(dir.dir, path, arr[arr.length - 1]);
              this.fileIndex = Object.assign({}, this.fileIndex);
              this.currentTask = "Waiting for changes...";
            }
          });
          this.currentTask = "Waiting for changes...";
        }
    },
    evaluateFileIndex() {
      for (let i of Object.keys(this.fileIndex)) {
        if (this.fileIndex[i].hasOwnProperty("type")) {
          let extention = this.fileIndex[i].type;
          if (extention && !this.foundFiletypes.includes(extention))
            this.foundFiletypes.push(extention);
        }
      }
    },
    scanDump() {
      if (this.dumpScanComplete) {
        this.scanAll();
        return;
      }
      return new Promise(async (resolve, reject) => {
        try {
          this.currentTask = `Preparing to scan cache directory...`;
          this.processing = true;
          this.dumpScanComplete = false;
          const content = await readdir(this.dumpDirectory);
          if (content)
            for (let i of content) {
              if (!this.processing) {
                this.dumpScanComplete = false;
                break;
              }

              this.currentTask = `Loading Dump: ${i}`;

              let fullPath = this.dumpDirectory + "/" + i;

              const buffer = readChunk.sync(fullPath, 0, fileType.minimumBytes);
              const _type = fileType(buffer);

              let extention = _type.mime.split("/")[1];

              if (extention && !this.foundFiletypes.includes(extention))
                this.foundFiletypes.push(extention);

              const stats = await stat(fullPath);
              if (i.includes("__")) {
                let splitName = i.split("__");
                let platform = splitName[0];
                let id = splitName[1];
                let timestamp = splitName[2].split(".")[0];
                let type = splitName[2].split(".")[1];
                let result = {
                  // originLocation: location,
                  dumpKey: i,
                  type,
                  created: stats["ctime"],
                  size: stats["size"]
                };

                this.fileIndex[i] = result;
              }
            }
          this.fileIndex = Object.assign({}, this.fileIndex);
          this.dumpScanComplete = true;
          this.processing = false;
          this.currentTask = `Ready.`;
          this.initWatchers();
          resolve();
        } catch (e) {
          this.processing = false;
          this.currentTask = `Failed access dump folder.`;
        }
      });
    },
    async scanAll() {
      this.dirScanComplete = false;
      for (let directory of this.watchDirectories) {
        await this.scanDirectory(directory);
      }
      this.initWatchers();
      this.dirScanComplete = true;
    },
    scanDirectory(directory) {
      return new Promise(async (resolve, reject) => {
        if (!this.dumpDirectory)
          return console.log(`Error: No dump directory set.`);

        let absoluteLocation = directory.dir + "/";

        this.currentTask = `Indexing cache directory for ${directory.name}`;
        this.processing = true;
        const directoryItems = await readdir(absoluteLocation);
        this.totalAnalysing = directoryItems.length;
        this.totalAnalysed = 0;
        for (let i of directoryItems) {
          if (this.processing === false) {
            this.dirScanComplete = false;
            break;
          }
          await this.processItem(directory, absoluteLocation + i, i);
        }
        this.processing = false;
        this.totalAnalysed = 0;
        this.currentTask = "Scan complete";
        this.initWatchers();
        this.fileIndex = Object.assign({}, this.fileIndex);
        resolve();
      });
    },
    async processItem(directory, location, name) {
      try {
        const buffer = readChunk.sync(location, 0, fileType.minimumBytes);
        const _type = fileType(buffer);

        let extention = _type && _type.mime ? _type.mime.split("/")[1] : null;
        if (extention && !this.foundFiletypes.includes(extention))
          this.foundFiletypes.push(extention);

        const stats = await stat(location);

        const type = _type ? _type.mime.split("/")[1] : "unknown";

        let fileKey = `${directory.name}__${name}__${new Date(
          stats["ctime"]
        ).getTime()}`;

        const fileKeyWithExtention =
          type !== "unknown" ? `${fileKey}.${type}` : fileKey;

        let result = {
          originLocation: location,
          dumpKey: fileKeyWithExtention,
          type,
          created: stats["ctime"],
          size: stats["size"]
        };
        this.totalAnalysed += 1;

        if (this.fileIndex.hasOwnProperty(result.dumpKey.split(".")[0])) {
          this.currentTask = `${name} already in dump.`;
          return;
        } else {
          this.currentTask = `Copying ${name} to dump.`;
        }

        this.fileIndex[fileKey] = result;

        await copyFile(
          location,
          this.dumpDirectory + "/" + fileKeyWithExtention
        );
      } catch (err) {
        console.log(err);
      }
    },
    purgeDump() {
      return new Promise(async (resolve, reject) => {
        this.currentTask = "Flushing the dump.";
        let loop = Object.keys(this.fileIndex);
        for (let i of loop) {
          let key = `${this.dumpDirectory}/${this.fileIndex[i].dumpKey}`;
          if (fs.existsSync(key)) await fs.unlinkSync(key);
        }
        this.currentTask = "Dump cleared. Press scan to repopulate.";
        this.fileIndex = {};
        this.foundFiletypes = [];
        resolve();
        win.webContents.session.clearCache(() => {
          console.log(
            "Attention: CacheMonkey Cache-Ception Prevention Transcension"
          );
        });
      });
    },
    purgeCache() {
      return new Promise(async (resolve, reject) => {
        this.currentTask = "Flushing the cache.";
        for (let app of this.watchDirectories) {
          console.log(app);
          const content = await readdir(app.dir);
          if (content) {
            for (let i of content) {
              // console.log(`${app.dir}/${i}`);
              await fs.unlinkSync(`${app.dir}/${i}`);
            }
          }
        }
        this.currentTask = "Cache cleared. Note: Files are still in the dump.";
        resolve();
      });
    },
    async purgeBoth() {
      await this.purgeDump();
      await this.purgeCache();
      this.currentTask = "Everything is gone :)";
    },
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
    },
    isMac() {
      return !!os.platform() === "darwin";
    }
  },
  computed: {
    ...mapGetters(["getTheme", "getThemeName"]),
    processing: {
      get() {
        return this.$store.state.processing;
      },
      set(value) {
        this.$store.state.processing = value;
      }
    },
    fileIndex: {
      get() {
        return this.$store.state.fileIndex;
      },
      set(value) {
        this.$store.state.fileIndex = value;
        setTimeout(() => {
          localStorage.setItem("fileIndex", JSON.stringify(this.fileIndex));
        });
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
    showModel: {
      get() {
        return this.$store.state.showModel;
      },
      set(value) {
        this.$store.state.showModel = value;
      }
    },
    picsDir: {
      get() {
        return this.$store.state.picsDir;
      },
      set(value) {
        this.$store.state.picsDir = value;
      }
    },
    viewingItem: {
      get() {
        return this.$store.state.viewingItem;
      },
      set(value) {
        this.$store.state.viewingItem = value;
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
    },
    showModel() {
      if (this.showModel) {
        document.body.classList.add("hidden");
      } else {
        document.body.classList.remove("hidden");
      }
    }
  }
};
</script>
<style lang="scss">
/* @import url("https://fonts.googleapis.com/css?family=Amaranth:700"); */

/* Big boy global styles */
body {
  margin: 0;
  line-height: 1;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background: var(--sidebar);
  color: var(--text);
  &.hidden {
    overflow: hidden;
  }
}
.logo {
  /* font-family: "Amaranth", sans-serif; */
  font-size: 27px;
}
.topbar {
  height: 25px;
  width: 100%;
  -webkit-app-region: drag;
  background: var(--sidebar);
  position: fixed;
  z-index: 999;
  display: flex;
}
#app {
  display: flex;
  transition: 200ms;

  /* background-color: var(--background); */
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
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  background: var(--main);
  border-radius: 15px 0 0 0;
  min-height: calc(100vh - 29px);
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
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 20px;
  margin-top: 9px;
  line-height: 21px;
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
.tippy-popper[x-placement^="left"] .tippy-tooltip .tippy-arrow {
  border-left: 7px solid #111111;
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
