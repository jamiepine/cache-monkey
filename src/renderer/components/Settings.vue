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
    <button class="coolbtn margin-vertical" @click="openDumpDirectory">Open Directory</button>
    <h4>Application Cache Folders</h4>
    <small>Add one or several</small>
    <button class="coolbtn margin-vertical" @click="chooseWatchDir">Add Cache Directory</button>
    <div class="flex">
      <div
        class="coolbtn margin-right"
        v-for="(i, index) of watchDirectories"
        :key="index"
      >{{i.name}}</div>
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
    chooseDumpDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) {
        this.dumpDirectory = dir[0].split("\\").join("/");
        this.fileIndex = {};
      }
    },
    chooseWatchDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0)
        this.watchDirectories.push({
          name: "discord",
          dir: dir[0].split("\\").join("/")
        });
    },
    openDumpDirectory() {
      shell.openItem(this.dumpDirectory);
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
    }
  }
};
</script>

<style>
</style>
