<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div class="heading-area">
      <h1>Cache thing</h1>
      <button @click="$store.dispatch('toggleDark')">Toggle theme</button>
      <button @click="scanDump">Scan Dump</button>
      <button @click="chooseDumpDir">Change Dump Directory</button>
      <br>
      <br>
      <div style="opacity:0.3;">Dump Dir:</div>
      <div>{{dumpDirectory}}</div>
      <div style="opacity:0.3;">Applications to watch:</div>
      {{watchDirectories}}
      <div style="opacity:0.3;">All Filetypes Discovered:</div>
      {{foundFiletypes}}
      <div style="opacity:0.3;">Current Task:</div>
      {{currentTask}}
      <div style="opacity:0.3;">Total Analysed:</div>
      <b>{{totalAnalysed}}/{{totalAnalysing}}</b>
      <div style="opacity:0.3;">Content Loaded:</div>
      <b>{{content.length}}</b>
      items.
      <div style="opacity:0.3;">dumpScanComplete:</div>
      {{dumpScanComplete}}
      <div style="opacity:0.3;">dirScanComplete:</div>
      {{dirScanComplete}}
      <div style="opacity:0.3;">Watching For New Files:</div>
      {{!watchBlocker}}
    </div>
    <div class="content">
      <div
        v-for="(i, index) of content"
        :key="index"
        class="image"
        :style="{ 'background-image': `url(${dumpDirectory}/${i.dumpKey})` }"
      ></div>
    </div>
    <!-- <div class="image" :style="{ 'background-image': `url(${test})` }"></div>
    {{test}}-->
    <br>
  </div>
</template>

<script>
import drivelist from "drivelist";
import SystemInformation from "./LandingPage/SystemInformation";
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
  name: "landing-page",
  components: { SystemInformation },
  mounted() {
    // set default dump directory
    this.dumpDirectory =
      Path.join(os.homedir(), `Documents`)
        .split("\\")
        .join("/") + "/_cache_dump_";

    this.scanDump();
  },
  computed: {
    content() {
      const everything = Object.keys(this.fileIndex).map(item => {
        if (item.type === "unknown" || item.type === "gzip") return false;
        return this.fileIndex[item];
      });
      return everything.sort((a, b) => a.created < b.created);
    }
  },
  data() {
    return {
      fileIndex: {},
      scan: [],
      drives: [],
      dumpDirectory: "",
      watchDirectories: ["discord"],
      foundFiletypes: [],
      // task tracking
      currentTask: false,
      totalAnalysing: 0,
      totalAnalysed: 0,
      dumpScanComplete: false,
      dirScanComplete: false,
      watchBlocker: true
    };
  },
  watch: {
    dumpScanComplete() {
      this.scanAll();
    },
    dirScanComplete() {
      this.initWatchers();
      setTimeout(() => (this.watchBlocker = false), 5000);
    }
  },
  methods: {
    initWatchers() {
      for (let dir of this.watchDirectories) {
        const watcher = chokidar.watch(this.appPath(dir), { persistent: true });
        watcher.on("add", async path => {
          if (this.watchBlocker !== true) {
            console.log("File", path, "has been added");
            await this.processItem(dir, path, path.split("Cache\\")[1]);
            this.fileIndex = Object.assign({}, this.fileIndex);
          }
        });
      }
    },
    chooseDumpDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) this.dumpDirectory = dir[0].split("\\").join("/");
    },
    appPath(directoryName) {
      const dir = Path.join(
        os.homedir(),
        `AppData/Roaming/${directoryName}/Cache`
      );
      if (!dir)
        return console.log(
          `Could not find cache folder for app "${directoryName}"`
        );
      return dir.split("\\").join("/");
    },

    scanDump() {
      return new Promise(async (resolve, reject) => {
        const content = await readdir(this.dumpDirectory);
        if (content)
          for (let i of content) {
            const stats = await stat(this.dumpDirectory + "/" + i);

            let splitName = i.split("__");
            let platform = splitName[0];
            let id = splitName[1];
            let timestamp = splitName[2].split(".")[0];
            let type = splitName[2].split(".")[1];
            console.log(result);
            let result = {
              // originLocation: location,
              dumpKey: i,
              type,
              created: stats["ctime"],
              size: stats["size"]
            };

            this.fileIndex[i] = result;
          }
        this.dumpScanComplete = true;
        this.fileIndex = Object.assign({}, this.fileIndex);
        resolve();
      });
    },
    async scanAll() {
      for (let directoryName of this.watchDirectories) {
        await this.scanDirectory(directoryName);
      }
      this.dirScanComplete = true;
    },
    scanDirectory(directoryName) {
      return new Promise(async (resolve, reject) => {
        if (!this.dumpDirectory)
          return console.log(`Error: No dump directory set.`);

        let absoluteLocation = this.appPath(directoryName) + "/";

        this.currentTask = `Indexing cache directory for ${directoryName}`;
        console.log(absoluteLocation);
        const directoryItems = await readdir(absoluteLocation);
        this.totalAnalysing = directoryItems.length;
        for (let i of directoryItems) {
          console.log(i);
          await this.processItem(directoryName, absoluteLocation + i, i);
        }
        this.currentTask = false;
        this.fileIndex = Object.assign({}, this.fileIndex);
        resolve();
      });
    },
    async processItem(directoryName, location, name) {
      try {
        this.currentTask = `Processing ${name}`;
        const buffer = readChunk.sync(location, 0, fileType.minimumBytes);
        const _type = fileType(buffer);
        if (_type && !this.foundFiletypes.includes(_type.mime))
          this.foundFiletypes.push(_type.mime);

        const stats = await stat(location);

        const type = _type ? _type.mime : "unknown";

        let fileKey = `${directoryName}__${name}__${new Date(
          stats["ctime"]
        ).getTime()}`;

        const fileKeyWithExtention =
          type !== "unknown" ? `${fileKey}.${type.split("/")[1]}` : fileKey;

        let result = {
          originLocation: location,
          dumpKey: fileKeyWithExtention,
          type,
          created: stats["ctime"],
          size: stats["size"]
        };

        if (this.fileIndex.hasOwnProperty(result.dumpKey)) return;

        this.fileIndex[fileKey] = result;
        this.totalAnalysed += 1;

        // if not already in dump, move to dump
        // TODO CHECK DUMP

        await copyFile(
          location,
          this.dumpDirectory + "/" + fileKeyWithExtention
        );
        this.currentTask = false;
      } catch (err) {
        this.currentTask = false;
        console.log(err);
      }
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    bytesToSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "0 Byte";
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    }
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
  background: var(--background);
}
.image {
  width: 100px;
  height: 100px;
  margin: 1px;
  background: #303030;
  float: left;
  background-size: cover;
}
#wrapper {
  /* background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  ); */
  height: 100vh;
  padding: 1px;
  width: 100vw;
  display: flex;
  flex-direction: row;
}
.heading-area {
  padding: 20px;
  position: fixed;
  width: 280px;
}
.content {
  margin-left: 280px;
}
#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.drives {
  display: flex;
  width: 100%;
  height: 150px;
  margin-top: 10px;
  .drive {
    border-radius: 5px;
    background: var(--sidebar);
    height: 150px;
    min-width: 100px;
    margin-right: 10px;
  }
}
</style>
