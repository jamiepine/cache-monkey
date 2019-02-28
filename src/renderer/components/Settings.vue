<template>
  <div class="page">
    <br>
    <h2>Settings</h2>
    <!-- <small>by Jamie Pine</small> -->
    <br>
    <h4>Dump Directory</h4>
    <small>This is the location where cache files are copied so that the originals are not modified.</small>
    <Input :value="dumpDirectory" @update="(value) => text = value" :big="true"/>
    <button class="coolbtn margin-vertical" @click="chooseDumpDir">Select Dump Directory</button>
    <button class="coolbtn margin-vertical" @click="openDirectory()">Open Directory</button>
    <h4>Application Cache Folders</h4>
    <small>Add one or several</small>
    <button class="coolbtn margin-vertical" @click="chooseWatchDir">Add Cache Directory</button>
    <div class="flex-column">
      <div style="display: flex;    height: 37px;" v-for="i of watchDirectories" :key="i.dir">
        <Input @update="(value) => updateDirName(index, value)" :value="i.name" :big="true"/>
        <Input :readonly="true" :value="i.dir" :big="true"/>
        <button style="    margin-left: 4px;" class="coolbtn" @click="openDirectory(i.dir)">
          <icon :icon="['fa','folder-open']"/>
        </button>
        <button style="    margin-left: 4px;" class="coolbtn" @click="rmDir(i.dir)">
          <icon :icon="['fa','trash']"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { promisify } from "util";
const { dialog } = require("electron").remote;
const { shell } = require("electron"); // deconstructing assignment
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
  components: {
    Input
  },
  methods: {
    updateDirName(i, value) {
      let obj = {};
      let count = 0;
      for (let thing of this.watchDirectories) {
        obj[count] = thing;
        count++;
      }
      obj[i].name = value;
      this.watchDirectories = Object.keys(obj).map(item => obj[item]);
      return this.watchDirectories;
    },
    rmDir(index) {
      this.watchDirectories.splice(index, 1);
    },
    chooseDumpDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) {
        this.dumpDirectory = dir[0].split("\\").join("/");
        localStorage.setItem('dumpDir', this.dumpDirectory)
        this.fileIndex = {};
      }
    },
    chooseWatchDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (!dir) return;
      if (dir.length > 0) {
        let cleanDir = dir[0].split("\\").join("/");
        let dirArray = cleanDir.split("/");
        let name = dirArray[dirArray.length - 2];
        this.watchDirectories.push({
          name: name,
          dir: dir[0].split("\\").join("/")
        });
      }
    },
    openDirectory(item) {
      if (item) shell.openItem(item);
      else shell.openItem(this.dumpDirectory);
    }
  },
  computed: {
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
        localStorage;
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
  }
};
</script>

<style>
</style>
