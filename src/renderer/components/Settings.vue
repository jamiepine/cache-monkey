<template>
  <div class="page">
    <h2>Settings</h2>
    <!-- <small>by Jamie Pine</small> -->
    <br>
    <h4>Dump Directory</h4>
    <small>This is the location where cache files are copied so that the originals are not modified.</small>
    <div class="flex-row">
      <Input
        style="margin-right: 5px;"
        :value="dumpDirectory"
        @update="(value) => dumpDirectory = value"
        :big="true"
      />
      <button class="coolbtn" style="height: 37px;" @click="chooseDumpDir">Choose</button>
    </div>
    <button class="coolbtn margin-vertical" @click="openDirectory()">Open Directory</button>
    <h4>Application Cache Folders</h4>
    <small>Add one or several</small>

    <div class="flex-column">
      <div
        style="display: flex; height: 37px;margin-bottom:4px;"
        v-for="i of watchDirectories"
        :key="i.dir"
      >
        <Input
          style="margin-right: 5px;"
          @update="(value) => updateDirName(index, value)"
          :value="i.name"
          :big="true"
        />
        <Input :readonly="true" :value="i.dir" :big="true"/>
        <button style="    margin-left: 4px;" class="coolbtn" @click="openDirectory(i.dir)">
          <icon :icon="['fa','folder-open']"/>
        </button>
        <button style="    margin-left: 4px;" class="coolbtn" @click="rmDir(i)">
          <icon :icon="['fa','trash']"/>
        </button>
      </div>
    </div>
    <div class="flex-row">
      <button class="coolbtn margin-vertical" @click="chooseWatchDir">Choose Cache Directory</button>
      <button
        class="coolbtn margin-vertical"
        style=" margin-left: 4px;"
        @click="addGoogleChrome"
      >Add Google Chrome</button>
      <button
        class="coolbtn margin-vertical"
        style=" margin-left: 4px;"
        @click="addDiscord"
      >Add Discord</button>
      <button
        class="coolbtn margin-vertical"
        style=" margin-left: 4px;"
        @click="addDiscordCanary"
      >Add Discord Canary</button>
      <button
        class="coolbtn margin-vertical"
        style=" margin-left: 4px;"
        @click="addDiscordPTB"
      >Add Discord PTB</button>
    </div>
    <div class="flex-row">
      <button class="coolbtn margin-vertical" style=" margin-left: 4px;" @click="addSlack">Add Slack</button>
    </div>
    <br>
    <h4>Save To Pictures Directory</h4>
    <small>This isn't important, but this is the direcotry that the "Save to Pictures" button copies the file to. Good for efficiently nabbing memes... and stuff.</small>
    <div class="flex-row">
      <Input
        style="margin-right: 5px;"
        :value="picsDir"
        @update="(value) => picsDir = value"
        :big="true"
      />
      <button class="coolbtn" style="height: 37px;" @click="choosePicturesDir">Choose</button>
    </div>
    <button class="coolbtn margin-vertical" @click="openDirectory()">Open Directory</button>
    <br>
    <button class="coolbtn margin-vertical" @click="$store.dispatch('toggleDark')">Toggle Theme</button>
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
    rmDir(directory) {
      // this.watchDirectories.splice(index, 1);

      this.watchDirectories = this.watchDirectories.filter(
        dir => directory.dir !== dir.dir
      );
    },
    chooseDumpDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) {
        this.dumpDirectory = dir[0].split("\\").join("/");
        localStorage.setItem("dumpDir", this.dumpDirectory);
        this.fileIndex = {};
      }
    },
    choosePicturesDir() {
      let dir = dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (dir.length > 0) {
        this.picsDir = dir[0].split("\\").join("/");
        localStorage.setItem("picsDir", this.picsDir);
      }
    },
    addDiscord() {
      let userDir = Path.join(os.homedir())
        .split("\\")
        .join("/");
      let directory = `${userDir}/AppData/Roaming/discord/Cache`;
      if (os.platform() === "darwin") {
        directory = `${userDir}/Library/Application Support/discord/Cache`;
      }
      let dupe = this.watchDirectories.filter(item => item.dir === directory);
      if (dupe.length > 0) return;
      if (fs.existsSync(directory)) {
        this.watchDirectories.push({
          name: "discord",
          dir: directory
        });
        this.watchDirectories = this.watchDirectories;
      } else {
        this.$root.$emit(
          "alert",
          "error",
          "Directory not found! You might not have this application installed."
        );
      }
    },
    addDiscordCanary() {
      let userDir = Path.join(os.homedir())
        .split("\\")
        .join("/");
      let directory = `${userDir}/AppData/Roaming/discordcanary/Cache`;
      if (os.platform() === "darwin") {
        directory = `${userDir}/Library/Application Support/discordcanary/Cache`;
      }
      let dupe = this.watchDirectories.filter(item => item.dir === directory);
      if (dupe.length > 0) return;
      if (fs.existsSync(directory)) {
        this.watchDirectories.push({
          name: "discordcanary",
          dir: directory
        });
        this.watchDirectories = this.watchDirectories;
      } else {
        this.$root.$emit(
          "alert",
          "error",
          "Directory not found! You might not have this application installed."
        );
      }
    },
    addDiscordPTB() {
      let userDir = Path.join(os.homedir())
        .split("\\")
        .join("/");
      let directory = `${userDir}/AppData/Roaming/discordptb/Cache`;
      if (os.platform() === "darwin") {
        directory = `${userDir}/Library/Application Support/discordptb/Cache`;
      }
      let dupe = this.watchDirectories.filter(item => item.dir === directory);
      if (dupe.length > 0) return;
      if (fs.existsSync(directory)) {
        this.watchDirectories.push({
          name: "discordptb",
          dir: directory
        });
        this.watchDirectories = this.watchDirectories;
      } else {
        this.$root.$emit(
          "alert",
          "error",
          "Directory not found! You might not have this application installed."
        );
      }
    },
    addSlack() {
      let userDir = Path.join(os.homedir())
        .split("\\")
        .join("/");
      let directory = `${userDir}/AppData/Roaming/Slack/Cache`;
      if (os.platform() === "darwin") {
        directory = `${userDir}/Library/Application Support/Slack/Cache`;
      }
      let dupe = this.watchDirectories.filter(item => item.dir === directory);
      if (dupe.length > 0) return;
      if (fs.existsSync(directory)) {
        this.watchDirectories.push({
          name: "slack",
          dir: directory
        });
        this.watchDirectories = this.watchDirectories;
      } else {
        this.$root.$emit(
          "alert",
          "error",
          "Directory not found! You might not have this application installed."
        );
      }
    },
    addGoogleChrome() {
      let userDir = Path.join(os.homedir())
        .split("\\")
        .join("/");
      let directory = `${userDir}/AppData/Local/Google/Chrome/User Data/Default/Cache`;
      if (os.platform() === "darwin") {
        directory = `${userDir}/Library/Application\ Support/Google/Chrome/Default/Application\ Cache/Cache`;
      }
      let dupe = this.watchDirectories.filter(item => item.dir === directory);
      console.log(dupe);
      if (dupe.length > 0) return;

      if (fs.existsSync(directory)) {
        this.watchDirectories.push({
          name: "chrome",
          dir: directory
        });
        this.watchDirectories = this.watchDirectories;
      } else {
        this.$root.$emit(
          "alert",
          "error",
          "Directory not found! You might not have this application installed."
        );
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
        let dupe = this.watchDirectories.filter(item => item.dir === cleanDir);
        if (dupe.length > 0) return;
        this.watchDirectories.push({
          name: name,
          dir: cleanDir
        });
        this.watchDirectories = this.watchDirectories;
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
    picsDir: {
      get() {
        return this.$store.state.picsDir;
      },
      set(value) {
        this.$store.state.picsDir = value;
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
        console.log("hi?");
        localStorage.setItem("watchDirectories", JSON.stringify(value));
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
