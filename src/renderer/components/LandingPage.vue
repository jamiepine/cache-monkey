<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div class="heading-area">
      <br>
      <h1>CacheMonkey</h1>
      <small>by Jamie Pine</small>
      <br>
      <Input :editable="false" :value="currentTask" @update="(value) => text = value" :big="false"/>
      <!-- <button @click="$store.dispatch('toggleDark')">Toggle theme</button> -->
      <button class="coolbtn margin-vertical" @click="scanDump">Load Data</button>
      <br>

      <div v-if="foundFiletypes.length > 0" style="opacity:0.3;">All Filetypes Discovered:</div>
      <div class="flex">
        <div
          class="coolbtn margin-right"
          v-for="(i, index) of foundFiletypes"
          :key="index"
          @click="filterItems(i)"
          :class="{ 'filtered': i.filtered }"
        >{{i.type.split('/')[1]}}</div>
      </div>

      <div style="opacity:0.3;">Total Analysed:</div>
      <b>{{totalAnalysed}}/{{totalAnalysing}}</b>
      <div style="opacity:0.3;">Content Loaded:</div>
      <b>{{content.length}}</b>
      <br>

      <button class="coolbtn margin-vertical" @click="chooseWatchDir">Purge Dump</button>
      <button class="coolbtn margin-vertical warning" @click="chooseWatchDir">Purge Cache</button>
      <button class="coolbtn margin-vertical danger" @click="chooseWatchDir">Purge Cache & Dump</button>
    </div>
    <div class="content" :class="{'no-interact opacity-low':contentLength}">
      <div
        v-for="(i, index) of content"
        :key="index"
        class="image"
        @click="click(i)"
        :style="{ 'background-image': `url(file://${dumpDirectory}/${i.dumpKey})` }"
      ></div>
    </div>
    <!-- <div class="image" :style="{ 'background-image': `url(${test})` }"></div>
    {{test}}-->
    <br>
  </div>
</template>

<script>
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

import Input from "./Input";
import { mapState } from "vuex";

export default {
  name: "landing-page",
  components: {
    Input
  },
  created() {
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

    fs.exists(dumpDir, exists => {
      if (exists) {
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
    });

    fs.exists(discordCacheDir, exists => {
      if (exists) {
        this.watchDirectories.push({
          name: "discord",
          dir: discordCacheDir
        });
      } else {
        this.currentTask = "Could not find Discord cache, please add manually.";
        ready = false;
      }
    });
    if (ready) {
      this.scanDump();
    }
  },
  computed: {
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
    },
    content() {
      const everything = Object.keys(this.fileIndex).map(
        item => this.fileIndex[item]
      );
      const filter = everything.filter(
        item => {
          if (this.currentFilter) {
            return item.type && item.type != "unknown" && (this.currentFilter && item.type == this.currentFilter)
          } else {
            return item.type && item.type != "unknown" && item.type != "gzip"
          }
        } 
      );
      // if (filter.length === 0)
      //   for (let i = 0; i < 50; i++) {
      //     filter.push({
      //       dumpKey: ""
      //     });
      //   }
      return filter.reverse();
    },
    contentLength() {
      return Object.keys(this.fileIndex).map(item => this.fileIndex[item])
        .length;
    }
  },
  data() {
    return {
      currentFilter: false
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
    click(item) {
      console.log(item);
    },
    initWatchers() {
      for (let dir of this.watchDirectories) {
        const watcher = chokidar.watch(dir.dir, { persistent: true });
        watcher.on("add", async path => {
          if (this.watchBlocker !== true) {
            console.log("File", path, "has been added");
            await this.processItem(dir.dir, path, path.split("Cache\\")[1]);
            this.fileIndex = Object.assign({}, this.fileIndex);
          }
        });
      }
      this.currentTask = "Waiting for changes...";
    },
    chooseDumpDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) this.dumpDirectory = dir[0].split("\\").join("/");
    },
    chooseWatchDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0)
        this.watchDirectories.push({
          name: "Custom",
          dir: dir[0].split("\\").join("/")
        });
    },
    // appPath(directoryName) {
    //   const dir = Path.join(
    //     os.homedir(),
    //     `AppData/Roaming/${directoryName}/Cache`
    //   );
    //   if (!dir)
    //     return console.log(
    //       `Could not find cache folder for app "${directoryName}"`
    //     );
    //   return dir.split("\\").join("/");
    // },

    scanDump() {
      return new Promise(async (resolve, reject) => {
        try {
          this.currentTask = `Preparing to scan cache directory...`;
          const content = await readdir(this.dumpDirectory);
          if (content)
            for (let i of content) {
              this.currentTask = `Reading File: ${i}`;

              let fullPath = this.dumpDirectory + "/" + i;

              const buffer = readChunk.sync(fullPath, 0, fileType.minimumBytes);
              const _type = fileType(buffer);
              const dupeTypes = [];

              for (let i = this.foundFiletypes.length; i --> 0;) {
                  if (_type && this.foundFiletypes[i].type == _type.mime) dupeTypes.push(_type.mime);
              }

              if (_type && dupeTypes.length <= 0)
                this.foundFiletypes.push({ type: _type.mime, filtered: false });

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
                console.log(i);

                this.fileIndex[i] = result;
              }
            }
          this.dumpScanComplete = true;
          this.fileIndex = Object.assign({}, this.fileIndex);
          resolve();
        } catch (e) {
          this.currentTask = `Failed access dump folder.`;
        }
      });
    },
    async scanAll() {
      for (let directory of this.watchDirectories) {
        await this.scanDirectory(directory);
      }
      this.dirScanComplete = true;
    },
    scanDirectory(directory) {
      return new Promise(async (resolve, reject) => {
        if (!this.dumpDirectory)
          return console.log(`Error: No dump directory set.`);

        let absoluteLocation = directory.dir + "/";

        this.currentTask = `Indexing cache directory for ${directory.name}`;
        const directoryItems = await readdir(absoluteLocation);
        this.totalAnalysing = directoryItems.length;
        for (let i of directoryItems) {
          await this.processItem(directory, absoluteLocation + i, i);
        }
        this.currentTask = "Scan complete";
        this.fileIndex = Object.assign({}, this.fileIndex);
        resolve();
      });
    },
    async processItem(directory, location, name) {
      try {
        this.currentTask = `Checking ${name}`;
        const buffer = readChunk.sync(location, 0, fileType.minimumBytes);
        const _type = fileType(buffer);
        const dupeTypes = [];

        for (let i = this.foundFiletypes.length; i --> 0;) {
            if (_type && this.foundFiletypes[i].type == _type.mime) dupeTypes.push(_type.mime);
        }

        if (_type && dupeTypes.length <= 0)
          this.foundFiletypes.push({ type: _type.mime, filtered: false });

        const stats = await stat(location);

        const type = _type ? _type.mime : "unknown";

        let fileKey = `${directory.name}__${name}__${new Date(
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

        this.currentTask = `Copying file to dump: ${name}`;

        this.fileIndex[fileKey] = result;
        this.totalAnalysed += 1;

        await copyFile(
          location,
          this.dumpDirectory + "/" + fileKeyWithExtention
        );
      } catch (err) {
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
    },
    filterItems(type) {
      if (type.filtered) {
        this.currentFilter = false;
        type.filtered = false;
        return;
      }
      
      const filteredTypes = [];

      for (let i = this.foundFiletypes.length; i --> 0;) {
          if (this.foundFiletypes[i].filtered) this.foundFiletypes[i].filtered = false;
      }

      type.filtered = true;
      this.currentFilter = type.type.split('/')[1];
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
  cursor: pointer;
  /* transition: 100ms; */
}
.image:hover {
  opacity: 0.7;
}
.flex {
  display: flex;
  width: 280px;
  flex-wrap: wrap;
  margin-top: 10px;
  .coolbtn {
    margin-bottom: 5px;
    &.filtered {
      background: #1bb9dc;
    }
  }
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
  display: flex;
  margin-left: 70px;
  flex-direction: column;
  background: var(--background2);
  height: 100vh;
}
.content {
  margin-left: 360px;
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
